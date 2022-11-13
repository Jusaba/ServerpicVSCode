/**
******************************************************
* @file ServerpicJson.js
* @brief Gestion del fichero.vscode/serverpic.json para la extesionon de vscode Serverpic
* @author Julian Salas Bartolome
* @version 1.0
* @date Noviembre 2022
*
* Se exportan las funciones para leer un parametro del json del fichero y para guardar un valor en cualquier parametro del json del fichero
* 
* Funciones exportadas
*
* async CreaJson (cDispoitivo, cPlaca).- Crea el Json del proyecto
* async GetJson ().- Devuelve el json del fichero .vscod/serverpic.json
* async GrabaServerpicJson (oJson).- Graba oJson en le fichero EXISTENTE .vscode/serverpic.json
* async LeeParamJson (cParametro).- Lee el fichero .vscode/serverpic.json y devuelve el valor del indicador cParametro
* async GrabaParamJson (cParametro, cValor).- Lee .vscode/serverpic.json y grava en el identificador cParametro el valor cValor
*                                       Si no existe el identificador, lo añade como nuevo y vuelve a grabar el fichero .vscode/serverpic.json
* async CreaServerpicJson (oJson).- Crea el ficheor INEXISTENTE .vscode/serverpic.json
*
* Funciones internas 
* async function Plataforma() .- Presenta las plataformas instaladas y deja seleccionar una
* async function VersionPlataforma(cPlataforma) .- Devuelve la version instalada de la plataforma
* async DatosPlataforma (cPlataforma ). Permite seleccionar el modelo de chip de la plataforma
*                                       Devuelve un array con datos de plataforma, version, chip, fqbn, parmetros de configuracion
*                                       compilador y direccion del compilador 
* PathFileToDir().- Convierte path de file a directorio
* PathDirToFile().- Convierte pat de directorio a path de file
*******************************************************/
'use strict';
const vscode = require("vscode")
const fs = require('fs');
const we = new vscode.WorkspaceEdit();

const iPlataforma = 0;
const iVersion = 1;
const iMdolo = 2;
const iFqbn = 3;
const iConfiguracion = 4;
const iCompilador = 5;
const iDirCompilador = 6;


//Determinamos path del directorio de tarabjao

var DirectorioTrabajo;
/**************************
* Funcion que trasnforma un path de file a directorio
* cambia %20 por espacio, %3A por : .....
* @param cDirectorio.- Nombre del path file que se quiere convertir
*
* @return.- Devuelve el directorio depurado
*/
function PathFileToDir ( cFIle )
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
function PathDirToFile ( cDirectorio )
{
	cPath = cDirectorio.split(':').join('%3A');
	cPath = cPath.split(' ').join('%20');
	var cPath = 'file:///'+cPath;
	return (cPath);
}
/**************************
* Funcion que presenta las plataformas instaladas
* 
* El listado de plataformas se almacena en .vscode\Plataformas.json
*/
async function Plataforma() {
	const cUsuario = require('os').homedir();
	const cPathExtension = `${cUsuario}\\.vscode\\extensions\\serverpic`

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
* Funcion que devuelve la version instalada de una plataforma
* 
* @param cPlataforma.- Plataforma seleccionada en la funcion Plataforma() 
* @return Devuelve la version isntalada de la plataforma seleccionada
*
* Busca en el directorio donde esta instalada la plataforma y con un dir, extrae la version isntalada  
*
*/
async function VersionPlataforma(cPlataforma) 
{
	const cUsuario = require('os').homedir();
	const DirectorioPackages = `${cUsuario}\\AppData\\Local\\Arduino15\\packages`;


	const Directorioesp8266 = `${DirectorioPackages}\\esp8266\\hardware\\esp8266`;
	const Directorioarduino = `${DirectorioPackages}\\arduino\\hardware\\avr`;
	const Directorioesp32 = `${DirectorioPackages}\\esp32\\hardware\\esp32`;
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
	}
	return (`${cVersion}`);
}
/**************************
* Funcion para seleccionar el modelo de chip  deseado dentro de la plataforma
*
* @param cPlataforma.- Plataforma seleccionada
*
* @return Devuelve un array con tres elementos
*				
*				[0].- Plataforma
*				[1].- Version de la plataforma	
*				[2].- Nombre del modelo de chip seleccionado
*				[3].- fqbn del modelo seleccionado
*				[4].- String con los parametros de configuracion para la compilacion del modelo seleccionada ( Memoria, velocidad, ....)
* 				[5].- Compilador
*				[6].- Directorio compilacion
*
*/
async function DatosPlataforma(cPlataforma) {
	const cUsuario = require('os').homedir();
	const cPathExtension = `${cUsuario}\\.vscode\\extensions\\serverpic`
	let aSalida = [];
	let aModelos = [];
	//Abrimos el fichero json con los chip  de la plataforma seleccionada
	let JsonBoards = fs.readFileSync(`${cPathExtension}\\Placas\\${cPlataforma}.json`);
	let oBoards = JSON.parse(JsonBoards);
	aSalida.push(cPlataforma);
	aSalida.push(VersionPlataforma(cPlataforma));
	//Hacemos un array con los modelos de chip de la plataforma almacenados en el fichero
	oBoards.Boards.forEach(element => {
		aModelos.push(element.name);
	});
	//Seleccionamos un chip
	const quickPick = await vscode.window.showQuickPick(aModelos, { canPickMany: false, placeHolder: 'Seleccionar modelo' });
	//Añadimos al array de salida el modelo de chip
	aSalida.push(quickPick);
	//Recorremos el json con las chip  
	for (var nPosicion in oBoards.Boards) {
		//cuando encontramos el bloque correpondiente al modelo seleccionado
		if (oBoards.Boards[nPosicion].name == quickPick) {
			let oJsonConfiguracion = oBoards.Boards[nPosicion].configuracion;

			//Añadimos al arrau de salida el fqbn
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
	}

	return (aSalida);
}
/**************************
* Funcion que genera el json de configuracion del proyecto
* 
* @param cDispositivo.- Nombre del dispositivo
* @param cPlaca.- Npombre de la placa
*
* @return Devuelve el objeto Json de configuracion
*/
exports.CreaJson = async function ( cDispositivo,  cPlaca )
{
		//Seleccionamos plataforma y determinamos la version del compilador instalado
		const cPlataforma = await Plataforma();
		const cVersionPlataforma = await VersionPlataforma(cPlataforma); 
		//Obtenemos los datos de la plataforma ( modelo chip, directorios, compilador, .... )
		const aDatosPlataforma = await DatosPlataforma(cPlataforma);

		//Path extension vscode	
		const cUsuario = require('os').homedir();
		const cPathExtension = `${cUsuario}\\.vscode\\extensions\\serverpic`
		//Path con la carpeta del proyecto
		const thisWorkspace = vscode.workspace.workspaceFolders[0].uri.toString();	//Determinamos file
		var cDirTrabajo = `${thisWorkspace}/${cDispositivo}`;						//Añadimos la carpeta del proyecto ( con el nombre del ino )
		cDirTrabajo = PathFileToDir(cDirTrabajo);									//Convertimos el file a dir
		var DirectorioVscode = `${cDirTrabajo}/.vscode`;							//determinamos el directorio .vscode dentro del proyecto
		DirectorioTrabajo = cDirTrabajo;											//Asignamsop valor a la variable global DirectorioTrabajo
		let oJson =																	//Elaboramos el json		
		{
			"dispositivo": cDispositivo,
			"folder": cDispositivo,
			"sketch": cDispositivo+'/'+cDispositivo+'.ino',
			"plataforma": cPlataforma,
			"version": cVersionPlataforma,
			"modelo": aDatosPlataforma[iMdolo],
			"placa": cPlaca,
			"fqbn": aDatosPlataforma[iFqbn],
			"configuration": aDatosPlataforma[iConfiguracion],
			"compilador": aDatosPlataforma[iCompilador],
			"com": 'COM',
			"baudios": 'Baudios', 
			"directorios":
			[	
				{
					"trabajo": 
					{
						"dirtrabajo" : DirectorioTrabajo,
						"dirvscode" : DirectorioVscode,		
						"diroutput" : DirectorioTrabajo + '/build'
					},
					"plataforma":
					{
						"dircompilador" : aDatosPlataforma[iDirCompilador]
					}	
				}	
			]
		};
		//Añadimos los directorios especificos para las librerias de la plataforma seleccionada
		let JsonModelo = fs.readFileSync(`${cPathExtension}\\Placas\\${cPlataforma}.json`);
		let oModelo = JSON.parse(JsonModelo);
		let oLibreriasGenericas =  oModelo.librerias[0].plataforma;
		oJson.directorios[0].plataforma['include'] = oLibreriasGenericas.include;
		oJson.directorios[0].plataforma['librerias'] = oLibreriasGenericas.librerias;
		oJson.directorios[0].plataforma['cores'] = oLibreriasGenericas.cores;
		oJson.directorios[0].plataforma['variants'] = oLibreriasGenericas.variants;
		await CreaServerpicJson(oJson);														//Creamos el fichero		
		return(oJson);
}
/**************************
* Funcion que lee un el json del fichero .vscode/serverpic.json de la carpeta de trabajo
* 
* @return Devuelve el objeto Json contenido en el fichero
*/
exports.GetJson = async function ()
{
    var fServerpicJson = fs.readFileSync (`${DirectorioTrabajo}/.vscode/serverpic.json`);	//Leemos serverpic.json del dispositivo
    var oServerpicJson = JSON.parse(fServerpicJson);
	return (oServerpicJson);
}    
/**************************
* Funcion que lee un el json del fichero .vscode/serverpic.json de la carpeta de trabajo
* 
* @return Devuelve el objeto Json contenido en el fichero
*/
async function LeeServerpicJson ()
{
    var fServerpicJson = fs.readFileSync (`${DirectorioTrabajo}/.vscode/serverpic.json`);	//Leemos serverpic.json del dispositivo
    var oServerpicJson = JSON.parse(fServerpicJson);
	return (oServerpicJson);
}    
/**************************
* Funcion que graba un Json en el fichero .vscode/serverpic.json
* 
* @param oJson.- Parametro que se quiere guardar
*
*/
async function GrabaServerpicJson (oJson)
{
	console.log(oJson);
	fs.writeFileSync(`${DirectorioTrabajo}/.vscode/serverpic.json`, JSON.stringify(oJson));
	console.log(`${DirectorioTrabajo}/.vscode/serverpic.json`);
}
/**************************
* Funcion que lee un parametro de la configuracion almacenada en Serverpic.json
* 
* @param cParametro.- Parametro que se quiere leer
* @return Devuelve el valor del parametro solicitado
*/
exports.LeeParamJson = async function (cParametro)
{
	var cDato;
	var oJson = await LeeServerpicJson ();
	switch (cParametro) {
		case 'sketch':
			cDato = oJson.sketch;
			break;
		case 'plataforma':
			cDato = oJson.plataforma;
			break;
		case 'version':
			cDato = oJson.version;
			break;
		case 'modelo':
			cDato = oJson.modelo;
			break;
		case 'fqbn':
			cDato = oJson.fqbn;
			break;
		case 'configuracion':
			cDato = oJson.configuracion;
			break;
		case 'compilador':
			cDato = oJson.compilador;
			break;
		case 'dircompilador':
			cDato = oJson.dircompilador;
			break;
		case 'output':
			cDato = oJson.output;
			break;
		case 'com':
			cDato = oJson.com;
			break;
		case 'baudios':
			cDato = oJson.baudios;
			break;
										
	}
	return (cDato);
}
/**************************
* Funcion que graba un nuevo valor para un parametro de la configuracion almacenada en Serverpic.json
* 
* @param cParametro.- Parametro que se quiere leer
*
*/
exports.GrabaParamJson = async function (cParametro, cValor)
{
	var oJson = await LeeServerpicJson ();
	switch (cParametro) {
		case 'sketch':
			oJson.sketch = cValor;
			break;
		case 'plataforma':
			oJson.plataforma = cValor;
			break;
		case 'version':
			oJson.version = cValor;
			break;
		case 'board':
			oJson.modelo = cValor;
			break;
		case 'fqbn':
			oJson.fqbn = cValor;
			break;
		case 'configuracion':
			oJson.configuracion = cValor;
			break;
		case 'compilador':
			oJson.compilador = cValor;
			break;
		case 'dircompilador':
			oJson.dircompilador = cValor;
			break;
		case 'output':
			oJson.output = cValor;
			break;
		case 'com':
			oJson.com = cValor;
			break;
		case 'baudios':
			oJson.baudios = cValor;
			break;						
		default :
			oJson[cParametro]=cValor;
	}
	console.log('----- '+DirectorioTrabajo+' --------')
	await GrabaServerpicJson (oJson);

}	
/**************************
* Funcion que crea el fichero .vscode/serverpic.json
*
* Como parametro utiliza la variable global  oJson con el json del proyecto
*/
async function CreaServerpicJson (oJson)
{
	const cFile = PathDirToFile(oJson.directorios[0].trabajo.dirvscode);
	let serverpicjson = vscode.Uri.parse(`${cFile}/serverpic.json`);
	we.createFile(serverpicjson, { ignoreIfExists: false, overwrite: true });
	let DataJson = JSON.stringify(oJson);
	we.insert(serverpicjson, new vscode.Position(0, 0), DataJson);
	vscode.commands.executeCommand('workbench.action.closeActiveEditor');                                                     //Cerramos el fichero abierto en workspace
	await vscode.workspace.applyEdit(we);   
	let document = await vscode.workspace.openTextDocument(serverpicjson); 
	await document.save();
}