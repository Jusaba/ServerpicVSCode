
//No se ha probado GetChip 
//Se deberia anular o arreglar GetDatosPlataforma
/*
******************************************************
* @file Auxiliares.js
* @brief Funciones auxiliares no incluidas en ficheros particulares
* @author Julian Salas Bartolome
* @version 1.0
* @date Diciembre 2022
*
* Funciones exportadas
* async GetPlaca () .- Solicita el nombre de la placa a utilizar
* async GetDispositivo ().- Obtiene el nombre del dispositivo a partir del nopmbre del directorio en el que se encuentra
* async GetPlataforma ().- Selecciona una plataforma
* async GetVersionPlataforma (cPlataforma).- Obtiene la version de una plataforma
* async GetChip (cPlataforma). Selecciona uyn chip de la plataforma
* async GetDatosChip(cPlataforma, cChip).- Obtiene datos de configuracion y compilacion del chip de la plataforma pasados como parametros
*                                       Devuelve un array con datos de plataforma, version, chip, fqbn, parmetros de configuracion
*                                       compilador y direccion del compilador 
*
* PathFileToDir().- Convierte path de file a directorio
* PathDirToFile().- Convierte path de directorio a path de file
* async ChecDirDocuments (). Determina si existe el directorio Documentos o Documents
*
* Funciones internas 
* ------------------
* async ChckDirExists (cDirectorio). Chekea la existencia de un directorio
*
*/

const cUsuario = require('os').homedir();
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const { window } = require("vscode")
const vscode = require("vscode")
const fs = require('fs');
const { Console } = require('console');


const cPathExtension = `${cUsuario}\\.vscode\\extensions\\serverpic`
const DirectorioPackages = `${cUsuario}\\AppData\\Local\\Arduino15\\packages`;
const DirectorioTrabajo =  vscode.workspace.workspaceFolders[0].uri.toString();
const DirectorioVscode = `${DirectorioTrabajo}/.vscode`


/**************************
* Funcion que solicita el nombre de la placa
* 
* @return Retorna el nombre de la placa tecleada
*/
exports.GetPlaca = async function ()
{
    const cPlaca = await window.showInputBox({ placeHolder: 'Teclee nombre de la placa a utilizar' })
    return cPlaca
}
/**************************
* Funcion que obtiene el nombre del dispositivo a partir del nopmbre del directorio en el que se encuentra
* 
* @return Retorna el nombre del dispositivo
*/
exports.GetDispositivo = async function ()
{
    var aPath = DirectorioTrabajo.split('/');
    const cDispositivo = aPath[aPath.length-1];
    return cDispositivo;

}
/**************************
* Funcion que presenta las plataformas instaladas y permite seleccionar una
* 
* @return Devuelve el nombre de la plataforma seleccionada
*/
exports.GetPlataforma = async function ()
{

    let aPlataformas = [];
	let JsonPlatforms = fs.readFileSync(`${cPathExtension}\\Placas\\Plataformas.json`);
	let oPlataformas = JSON.parse(JsonPlatforms);
	// Array con las plataformas almacenadas en Plataformas.json
	oPlataformas.Plataformas.forEach(element => {
		aPlataformas.push(element.name);
	});
	//Seleccion plataforma
	const quickPick = await vscode.window.showQuickPick(aPlataformas, { canPickMany: false, placeHolder: 'Seleccionar Plataforma' });
	return (`${quickPick}`);

}
/**************************
* Funcion que devuuelve la version de una plataforma instalada
* 
* @param cPlataforma.- Plñataforma de la que se desea conocer la version 
*
* @return Devuelve la version de la plataforma instalada
*/
exports.GetVersionPlataforma = async function (cPlataforma)
{

	const Directorioesp8266 = `${DirectorioPackages}\\esp8266\\hardware\\esp8266`;
	const Directorioarduino = `${DirectorioPackages}\\arduino\\hardware\\avr`;
	const Directorioesp32 = `${DirectorioPackages}\\esp32\\hardware\\esp32`;
	const DirectorioHeltecesp32 = `${DirectorioPackages}\\Heltec-esp32\\hardware\\esp32`;
	//En funcion de la plataforma seleccionada, accedemos a su directorio y leemos el nombre de la carpeta que contiene la paltaforma 
	let cVersion = '';
	switch (cPlataforma) {
		case 'arduino':
			cVersion = fs.readdirSync(`${Directorioarduino}`);
			break;
		case 'esp8266':
			cVersion = fs.readdirSync(`${Directorioesp8266}`);
			break;
		case 'esp32':
			cVersion = fs.readdirSync(`${Directorioesp32}`);
			break;
		case 'Heltec-esp32':
			cVersion = fs.readdirSync(`${DirectorioHeltecesp32}`);
			break;			
	}
	return (`${cVersion}`);
}
/**************************
* Funcion que permite seleccionar un modelo de chip de una plataforma determinada
* 
* @param cPlataforma.- Plataforma de la que se desea seleccionar un chip 
*
* @return Devuelve el nombre del chip seleccionado
*/
exports.GetChip = async function (cPlataforma)
{
	let JsonBoards = fs.readFileSync(`${cPathExtension}\\Placas\\${cPlataforma}.json`);   //Obtenemos el json de la plataforma deseada
	let oBoards = JSON.parse(JsonBoards);
	let aModelos = [];
	oBoards.Boards.forEach(element => {													  //creamos un array con los distintos chips de la plataforma	
		aModelos.push(element.name);
	});
	const quickPick = await vscode.window.showQuickPick(aModelos, { canPickMany: false, placeHolder: 'Seleccionar modelo' }); //Seleccionamos uno
	return (quickPick);
}

/**************************
* Funcion para obtener datos de configuracion y de compilacion del chip de la plataforma pasados como parametro
*
* @param cPlataforma.- Plataforma seleccionada
* @param cChip.- Chip seleccionado
*
* @return Devuelve un array con los siguientes elementos
*				
*				[0].- Plataforma
*				[1].- Version de la plataforma	
*				[2].- Nombre del modelo de chip seleccionado
*				[3].- Posicion del modelo dentro del Json
*				[4].- fqbn del modelo seleccionado
*				[5].- String con los parametros de configuracion para la compilacion del modelo seleccionada ( Memoria, velocidad, ....)
* 				[6].- Compilador
*				[7].- Directorio compilacion
*
*/
exports.GetDatosChip = async function (cPlataforma, cChip)
{

    let aSalida = [];
	//Abrimos el fichero json con los chip  de la plataforma seleccionada
	let JsonBoards = fs.readFileSync(`${cPathExtension}\\Placas\\${cPlataforma}.json`);
	let oBoards = JSON.parse(JsonBoards);
	aSalida.push(cPlataforma);
	aSalida.push(await this.GetVersionPlataforma(cPlataforma));
	aSalida.push(cChip);
	//Recorremos el json con los chip  
	for (var nPosicion in oBoards.Boards) {
		//cuando encontramos el bloque correpondiente al modelo seleccionado
		if (oBoards.Boards[nPosicion].name == cChip) {
			aSalida.push(nPosicion);											//Posicion del modelo dentro del Json
			let oJsonConfiguracion = oBoards.Boards[nPosicion].configuracion;

			//Añadimos al array de salida el fqbn
			aSalida.push(oBoards.Boards[nPosicion].configuracion.fqbn);
			//generamos la variable configuracion con todos los parametros de configuracion para la compilacion
			let cConfiguracion = '';
			if (oJsonConfiguracion["xtal"]) { cConfiguracion = cConfiguracion + `xtal=${oJsonConfiguracion.xtal},`; }
			if (oJsonConfiguracion["vt"]) { cConfiguracion = cConfiguracion + `vt=${oJsonConfiguracion.vt},`; }
			if (oJsonConfiguracion["exception"]) { cConfiguracion = cConfiguracion + `exception=${oJsonConfiguracion.exception},`; }
			if (oJsonConfiguracion["ssl"]) { cConfiguracion = cConfiguracion + `ssl=${oJsonConfiguracion.ssl},`; }
			if (oJsonConfiguracion["ResetMethod"]) { cConfiguracion = cConfiguracion + `ResetMethod=${oJsonConfiguracion.ResetMethod},`; }
			if (oJsonConfiguracion["CrystalFreq"]) { cConfiguracion = cConfiguracion + `CrystalFreq=${oJsonConfiguracion.CrystalFreq},`; }
			if (oJsonConfiguracion["FlashFreq"]) { cConfiguracion = cConfiguracion + `FlashFreq=${oJsonConfiguracion.FlashFreq},`; }
			if (oJsonConfiguracion["FlashMode"]) { cConfiguracion = cConfiguracion + `FlashMode=${oJsonConfiguracion.FlashMode},`; }
			if (oJsonConfiguracion["eesz"]) { cConfiguracion = cConfiguracion + `eesz=${oJsonConfiguracion.eesz},`; }
			if (oJsonConfiguracion["sdk"]) { cConfiguracion = cConfiguracion + `sdk=${oJsonConfiguracion.sdk},`; }
			if (oJsonConfiguracion["ip"]) { cConfiguracion = cConfiguracion + `ip=${oJsonConfiguracion.ip},`; }
			if (oJsonConfiguracion["dbg"]) { cConfiguracion = cConfiguracion + `dbg=${oJsonConfiguracion.dbg},`; }
			if (oJsonConfiguracion["lvl"]) { cConfiguracion = cConfiguracion + `lvl=${oJsonConfiguracion.lvl},`; }
			if (oJsonConfiguracion["wipe"]) { cConfiguracion = cConfiguracion + `wipe=${oJsonConfiguracion.wipe},`; }
			if (oJsonConfiguracion["baud"]) { cConfiguracion = cConfiguracion + `baud=${oJsonConfiguracion.baud},`; }
			if (oJsonConfiguracion["PartitionScheme"]) { cConfiguracion = cConfiguracion + `PartitionScheme=${oJsonConfiguracion.PartitionScheme},`; }
			if (oJsonConfiguracion["DebugLevel"]) { cConfiguracion = cConfiguracion + `DebugLevel=${oJsonConfiguracion.DebugLevel},`; }
			if (oJsonConfiguracion["UploadSpeed"]) { cConfiguracion = cConfiguracion + `UploadSpeed=${oJsonConfiguracion.UploadSpeed},`; }

			cConfiguracion = cConfiguracion.substring(0, cConfiguracion.length - 1);
			//Añadimos al array de salida el string con la configuracion
			aSalida.push(cConfiguracion);
		}
	}
	switch (cPlataforma) {
		case 'arduino':
//Pendiente----------------------------------------------------------------------------------------------------------------------
//******************************************************************************************************************************* */
			break;
		case 'esp8266':
			aSalida.push('xtensa-lx106-elf-g++')
			aSalida.push('xtensa-lx106-elf-gcc/2.5.0-4-b40a506')
			break;
		case 'esp32':
			aSalida.push('xtensa-esp32-elf-gcc')
			aSalida.push('xtensa-esp32-elf-gcc/1.22.0-97-gc752ad5-5.2.0')
			break;
		case 'Heltec-esp32':
			aSalida.push('xtensa-esp32-elf-gcc')
			aSalida.push('xtensa-esp32-elf-gcc/1.22.0-80-g6c4433a-5.2.0')
			break;			
	}
	return (aSalida);
}

/**************************
* Funcion que trasnforma un path de file a directorio
* cambia %20 por espacio, %3A por : .....
* @param cDirectorio.- Nombre del path file que se quiere convertir
*
* @return.- Devuelve el directorio depurado
*/
exports.PathFileToDir = function  ( cFIle )
{
	var cPath = (cFIle.toString()).replace('file:///', ``)
	cPath = cPath.split('%20').join(' ');
	cPath = cPath.split('%3A').join(':');
	return(cPath)
}
/**************************
* Funcion que transforma path de dirextorio en path para file
* cambi %20 por espacio, %3A por : .....
* @param cDirectorio.- Nombre del directorio que se quiere convertir
*
* @return.- Devuelve el path del file
*/
exports.PathDirToFile = function  ( cDirectorio )
{
	cPath = cDirectorio.split(':').join('%3A');
	cPath = cPath.split(' ').join('%20');
	var cPath = 'file:///'+cPath;
	return (cPath);
}
/**************************
* Funcion que  comprueba si el ordenador tiene el directorio Documents o Documentos
* 
* @return Devuelve el nombre del directorio existente
*/
exports.ChecDirDocuments = async function  ()
{
	var cSalida = 'Documents';
	let cDirUsuario =  cUsuario.split('\\').join('/');
	if (await ChckDirExists (cDirUsuario+'/Documentos'))
	{
		cSalida = 'Documentos';
	}
	return(cSalida);
}
/**************************
* Funcion que chekea la exisencia de un directorio
* 
* @param cDirectorio.- Directorio que se desea checkear
* @return Devuelve true si existe el directorio, false en caso contrario
*/
async function ChckDirExists (cDirectorio)
{
	var lSalida = false;
	if (fs.existsSync(cDirectorio))
	{
		lSalida = true;
	}
	return ( lSalida);
}
/**************************
* Funcion que borra el fichero .vscode/serverpic.json
* 
*/
exports.BorraJson = async function ()
{
	const cPath = this.PathFileToDir(DirectorioVscode+'/serverpic.json');

	if (ChckDirExists(cPath))
	{
		fs.unlinkSync(cPath);
	}	
}
/**************************
* Funcion que borra el fichero .vscode/c_cpp_properties.json
* 
*/
exports.BorraProperties = async function ()
{
	const cPath = this.PathFileToDir(DirectorioVscode+'/c_cpp_properties.json');

	if (ChckDirExists(cPath))
	{
		fs.unlinkSync(cPath);
	}	
}	
