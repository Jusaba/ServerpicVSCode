
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
const Snippet = require ('./CreaSnippet.js');

//Configuracion directorios
//Se debe estudiar si esto se permite configurar desde la configuracion de la extension
const cPathExtension = `${cUsuario}\\.vscode\\extensions\\serverpic`
const DirectorioPackages = `${cUsuario}\\AppData\\Local\\Arduino15\\packages`;


var aBoard ;


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
		var cfqbn = await JsonServerpic.LeeParamJson('fqbn');
		var cConfiguration = await JsonServerpic.LeeParamJson('configuration');
		var cCompila = `arduino-cli compile -b ${cfqbn}:${cConfiguration} --build-path build -e -v `;
		vscode.commands.executeCommand('workbench.action.terminal.focus');
		vscode.commands.executeCommand('workbench.action.terminal.sendSequence', { "text": cCompila  +'\n' });
	}else{
		vscode.window.showErrorMessage('Se debe seleccionar un micro valido');
	}
}
async function nc()
{

	//nmap -> https://mega.nz/file/PdFVUIIK#V2JJRgyCY03Sq466wCxkh0z8-1A94G81EqbJj9lkZ_E
		var cNc = `ncat picservertest.jusaba.es 2000`;
		vscode.commands.executeCommand('workbench.action.terminal.focus');
		vscode.commands.executeCommand('workbench.action.terminal.sendSequence', { "text": cNc  +'\n' });
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


		let oJson = await JsonServerpic.CreaJson(cDispositivo, Placa, 1);


		//Ficheros.SetPathProyecto(DirectorioTrabajo);
		Ficheros.CreaArchivos(oJson);

		
	

	});
	let disposable1 = vscode.commands.registerCommand("serverpic.monitor", async () => {
		//Creamos un canal para escribir en la consola de salida con el nombre Serverpic
		var outChannel = vscode.window.createOutputChannel('Serverpic');
		outChannel.clear();
		outChannel.appendLine("[Start] Monitor");
		
		Monitor();

	});

	let disposable2 = vscode.commands.registerCommand("serverpic.SerialPortSel", async () => {
		await port.LeePuertos();
	});	
	let disposable3 = vscode.commands.registerCommand("serverpic.BaudiosSel", async () => {
		await port.BaudioSel (); 
	});	
	let disposable4 = vscode.commands.registerCommand("serverpic.ModeloSel", async () => {
		JsonServerpic.PlataformaWork();
	});	
	let disposable5 = vscode.commands.registerCommand("serverpic.compila", async () => {
		
		JsonServerpic.DatosPlataformaWork();
		//Snippet.CreaSnippets();
		
		//Compila ();
		//JsonServerpic.GrabaParamJson('PathCompilador', 'c:/user');
		//nc();
		//https://www.configserverfirewall.com/windows-10/netcat-windows/
	});	
	let disposable6 = vscode.commands.registerCommand("serverpic.upload", async () => {
		Upload (); 
	});	
	let disposable7 = vscode.commands.registerCommand("serverpic.server", async () => {
		nc (); 
	});	
	let disposable8 = vscode.commands.registerCommand("serverpic.reload", async () => {
		JsonServerpic.DirWork();		
	});	

	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable1);
	context.subscriptions.push(disposable2);
	context.subscriptions.push(disposable3);
	context.subscriptions.push(disposable4);
	context.subscriptions.push(disposable5);
	context.subscriptions.push(disposable6);
	context.subscriptions.push(disposable7);
	context.subscriptions.push(disposable8);
}	


// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
