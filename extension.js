
const cUsuario = require('os').homedir();
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const { window } = require("vscode")
const vscode = require("vscode")
const fs = require('fs');
const { Console } = require('console');
//const { homedir } = require("os");
const port = require ('./SerialPOrt.js');
const BarraEstado = require ('./StatusBar.js');
const JsonServerpic = require('./ServerpicJson.js');
const Ficheros = require ('./Ficheros.js');

//Configuracion directorios
//Se debe estudiar si esto se permite configurar desde la configuracion de la extension
const cPathExtension = `${cUsuario}\\.vscode\\extensions\\serverpic`
const DirectorioPackages = `${cUsuario}\\AppData\\Local\\Arduino15\\packages`;


var aBoard;


async function LeeDirectorio (cDirectorio)
{
	var cDirTot = '';
	var cDirInd = '';

	cDirTot = cDirTot+'\t\t\t\t'+'\"'+(cDirectorio.substring(0, cDirectorio.length - 1))+'\",'+'\n';	//Directorio contenedor
	let files = fs.readdirSync(cDirectorio)																//Leemos el contenido del directorio
	files.forEach(file => {																				//Recorremos el contenido
		cDirInd = cDirectorio+file;																		//Añadimos todo el path al objetivo
		var stat = fs.statSync(cDirInd)																	//Miramos de que tipo es el objetivo 
		if (stat.isDirectory())																			//Si es un directorio
		{
			if (fs.existsSync(cDirInd+'/src'))															//Miramos si en el hay otro directorio src
			{
				cDirTot = cDirTot+'\t\t\t\t'+'\"'+cDirInd+'/src\",'+'\n';								//Si lo hay agragamos el directorio src
			}else{
				cDirTot = cDirTot+'\t\t\t\t'+'\"'+cDirInd+'\",'+'\n';									//Si no, el directorio original
			}
		}
	})
	return (cDirTot);
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

async function Create_Intellisense (cModelo, cDirUsuario, cPlataforma, cVersion)
{
	var cListaLib = '';
	/*
	const thisWorkspace = vscode.workspace.workspaceFolders[0].uri.toString();
	const DirectorioTrabajo = `${thisWorkspace}/${cDispositivo}`;
	const DirectorioVscode = `${thisWorkspace}/${cDispositivo}/.vscode`;
	*/

	//const items = fs.readdir("C:\\Users\\Julian\\AppData\\Local\\Arduino15\\packages\\esp32\\hardware\\esp32\\1.0.6\\tools\\sdk\\include\\");
	//console.log(items);


	var cDirectorio = `${cDirUsuario}/AppData/Local/Arduino15/packages/${cPlataforma}/hardware/${cPlataforma}/${cVersion}/tools/sdk/include/`
	cListaLib =  await LeeDirectorio(cDirectorio);
	cDirectorio = `${cDirUsuario}/AppData/Local/Arduino15/packages/${cPlataforma}/hardware/${cPlataforma}/${cVersion}/libraries/`
	cListaLib =   cListaLib + await LeeDirectorio(cDirectorio);
	cDirectorio = `${cDirUsuario}/AppData/Local/Arduino15/packages/${cPlataforma}/hardware/${cPlataforma}/${cVersion}/cores/${cPlataforma}/`
	cListaLib =   cListaLib + await LeeDirectorio(cDirectorio);
	cDirectorio = `${cDirUsuario}/AppData/Local/Arduino15/packages/${cPlataforma}/hardware/${cPlataforma}/${cVersion}/variants/${cModelo}/`
	cListaLib =   cListaLib + await LeeDirectorio(cDirectorio);	
	if (ChckDirExists(`${cDirUsuario}/Documents`))
	{
		cDirectorio = `${cDirUsuario}/Documents/Arduino/libraries/`
	}else{
		cDirectorio = `${cDirUsuario}/Documentos/Arduino/libraries/`
	}
	cListaLib =   cListaLib + await LeeDirectorio(cDirectorio);
	cListaLib = cListaLib.substring(0, cListaLib.length-2); 
                    
	return(cListaLib);
} 

function CheckModelo()
{	var lSalida = false;
	var cModelo = BarraEstado.LeeModelo();
	if ( cModelo != 'Modelo')
	{
		lSalida = true;
	}
	return lSalida;	

}
async function Upload ()
{
	if (await port.CheckCOM () == true)
	{
		if ( CheckModelo() == true)
		{
			var cPath = vscode.workspace.workspaceFolders[0].uri.toString();
			var aTexto = cPath.split('/');
			var cFile = aTexto[aTexto.length-1]+".ino.bin";
			var cUpload = `arduino-cli upload -p ${await BarraEstado.LeeCom()} -b ${aBoard[3]} -i build/`+cFile;
			vscode.commands.executeCommand('workbench.action.terminal.focus');
			vscode.commands.executeCommand('workbench.action.terminal.sendSequence', { "text": cUpload  +'\n' });
		}else{
			vscode.window.showErrorMessage('Se debe seleccionar un micro valido')
		}
	}else{
		vscode.window.showErrorMessage('Se debe seleccionar puerto valido');
	}	
}
async function Compila()
{

	if (CheckModelo () == true)
	{
		var cCompila = `arduino-cli compile -b ${aBoard[3]}:${aBoard[4]} --build-path build -e -v `;
		vscode.commands.executeCommand('workbench.action.terminal.focus');
		vscode.commands.executeCommand('workbench.action.terminal.sendSequence', { "text": cCompila  +'\n' });
	}else{
		vscode.window.showErrorMessage('Se debe seleccionar un micro valido');
	}
}
async function Monitor ()
{
	var cPuerto = await BarraEstado.LeeCom();
	var cBaudios = await BarraEstado.LeeBaudios();
	if (await port.CheckCOM () == true)
	{
		var cTerminal = "arduino-cli monitor -p "+cPuerto+" -c baudrate="+cBaudios+ " -c bits=8 -c parity=none -c stop_bits=1 -c dtr=off -c rts=off"	;																	//Ponemos en la barra de estado la nueva velocidad
		vscode.commands.executeCommand('workbench.action.terminal.focus');
		vscode.commands.executeCommand('workbench.action.terminal.sendSequence', { "text": cTerminal  +'\n' });
	}else{
		vscode.window.showErrorMessage('Se debe seleccionar puerto valido');
	}

}









// this method is called when your extension is activated
// your extension is activated the very first time the command is executed


/**************************
* Funcion que presenta las plataformas instaladas
* 
* El listado de plataformas se almacena en .vscode\Plataformas.json
*/
async function Plataforma() {
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
async function VersionPlataforma(cPlataforma) {

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
async function ModeloPlataforma(cPlataforma) {
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

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	BarraEstado.StatusBarServerpic();

	let disposable = vscode.commands.registerCommand("serverpic.new", async () => {


	
		window.showInformationMessage('Bienvenido a Serverpic 1.0');
		const cDispositivo = await window.showInputBox({ placeHolder: 'Teclee nombre de dispositivo' })
		const Placa = await window.showInputBox({ placeHolder: 'Teclee nombre de la placa a utilizar' })


		let Fecha = new Date();
		Fecha = Fecha.toLocaleDateString();
		const we = new vscode.WorkspaceEdit();
		const thisWorkspace = vscode.workspace.workspaceFolders[0].uri.toString();
		const DirectorioTrabajo = `${thisWorkspace}/${cDispositivo}`;
		const DirectorioVscode = `${thisWorkspace}/${cDispositivo}/.vscode`;


		let oJson = await JsonServerpic.CreaJson(cDispositivo, Placa);


		Ficheros.SetPathProyecto(DirectorioTrabajo);
		Ficheros.CreaArchivos(oJson);

		
		// definimos los ficheros a incluir
/*		                                                       
		let properties = vscode.Uri.parse(`${DirectorioVscode}/c_cpp_properties.json`);
		//Creamos un array de los ficheros y los creamos
		let newFiles = [ properties];                                                                             // Creamos array de ficheros
		for (const newFile of newFiles) { we.createFile(newFile, { ignoreIfExists: false, overwrite: true }) };

		                                                   //Cerramos el fichero abierto en workspace
	
		
		                                            //Cerramos el fichero abierto en workspace


*/	

		//-------------------
		//Fichero c_cpp_properties
		//-------------------
/*		let cDirUsuario = (`${cUsuario}`.toString()).replace('\\', '/');
		cDirUsuario = (cDirUsuario.toString()).replace('\\', '/');
		let cDirectoriosLib = await Create_Intellisense (aDatosPlataforma[2], cDirUsuario, aDatosPlataforma[0], cVersionPlataforma);
		let uriProperties = vscode.Uri.file(`${FolderExtension}/Plantillas/c_cpp_properties.jso_`);                                                 //Establecemos el path de la plantilla TeamCity
		let oPropertiesTexto = vscode.workspace.openTextDocument(uriProperties);                                                               		//
		let PropertiesTexto = ((await oPropertiesTexto).getText());                                                                             	//Extraemos el texto de la plantilla    
		PropertiesTexto = PropertiesTexto.split('#Dirusuario#').join(cDirUsuario);																	//Hacemos las sustituciones permanantes
		PropertiesTexto = PropertiesTexto.split('#Plataforma#').join(aDatosPlataforma[0]);
		PropertiesTexto = PropertiesTexto.split('#Version#').join(cVersionPlataforma);
		PropertiesTexto = PropertiesTexto.split('#DirCompilador#').join(aDatosPlataforma[6]);
		PropertiesTexto = PropertiesTexto.split('#Compilador#').join(aDatosPlataforma[5]);
		PropertiesTexto = PropertiesTexto.split('#DirLib#').join(cDirectoriosLib);
		

		we.insert(properties, new vscode.Position(0, 0), PropertiesTexto);                                                                       //Grabamos la informacion en el prigrama ino
		vscode.commands.executeCommand('workbench.action.closeActiveEditor');     

		await vscode.workspace.applyEdit(we);                                                                                       // apply all the edits: file creation and adding text
		for (const newFile of newFiles) { let document = await vscode.workspace.openTextDocument(newFile); await document.save(); };
*/		
		//for (const newFile of newFiles) { let document = await vscode.workspace.openTextDocument(newFile); await document.save(); };

		//vscode.commands.executeCommand('workbench.action.closeFolder');
		

	});
	let disposable1 = vscode.commands.registerCommand("serverpic.monitor", async () => {
		//Creamos un canal para escribir en la consola de salida con el nombre Serverpic
		var outChannel = vscode.window.createOutputChannel('Serverpic');
		outChannel.clear();
		outChannel.appendLine("[Start] Compilando");
		
		const Directoriotrabajo = vscode.workspace.workspaceFolders[0].uri.toString();
		
		outChannel.appendLine(Directoriotrabajo);
		//Preparamos para ejecutar el bat
		Monitor();

	});

	let disposable2 = vscode.commands.registerCommand("serverpic.SerialPortSel", async () => {
		await port.LeePuertos();
	});	
	let disposable3 = vscode.commands.registerCommand("serverpic.BaudiosSel", async () => {
		await port.BaudioSel (); 
	});	
	let disposable4 = vscode.commands.registerCommand("serverpic.ModeloSel", async () => {
		let cPlataforma = await Plataforma();
		let cVersionPlataforma = await VersionPlataforma(cPlataforma);
		//Seleccionamos el modelo de placa
		let aDatosPlataforma = await ModeloPlataforma(cPlataforma);
		BarraEstado.GrabaModelo(aDatosPlataforma[2]);
		aBoard = aDatosPlataforma;
	});	
	let disposable5 = vscode.commands.registerCommand("serverpic.compila", async () => {
		//Compila ();
		JsonServerpic.GrabaParamJson('PathCompilador', 'c:/user');
		
	});	
	let disposable6 = vscode.commands.registerCommand("serverpic.upload", async () => {
		Upload (); 
	});	
	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable1);
	context.subscriptions.push(disposable2);
	context.subscriptions.push(disposable3);
	context.subscriptions.push(disposable4);
	context.subscriptions.push(disposable5);
	context.subscriptions.push(disposable6);
}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
