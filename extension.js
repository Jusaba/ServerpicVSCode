// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const { window } = require("vscode")
const vscode = require("vscode")
const { execSync } = require("child_process")
const path = require("path")
const { readFile } = require("fs/promises")
const fs = require('fs');
const { isConstructorDeclaration } = require("typescript")
const { homedir } = require("os")
const { json } = require("stream/consumers")

//Configuracion directorios
//Se debe estudiar si esto se permite configurar desde la configuracion de la extension
const cPathExtension = "C:\\Users\\julian\\.vscode\\extensions\\serverpic"
const DirectorioPackages = "C:\\Users\\julian\\AppData\\Local\\Arduino15\\packages";


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
*				[0].- Nombre del modelo de chip seleccionado
*				[1].- fqbn del modelo seleccionado
*				[2].- String con los parametros de configuracion para la compilacion del modelo seleccionada ( Memoria, velocidad, ....)
* 
*
*/
async function ModeloPlataforma(cPlataforma) {
	let aSalida = [];
	let aModelos = [];
	//Abrimos el fichero json con los chip  de la plataforma seleccionada
	let JsonBoards = fs.readFileSync(`${cPathExtension}\\Placas\\${cPlataforma}.json`);
	let oBoards = JSON.parse(JsonBoards);
	//Hacemos un array con los modelos de chip de la plataforma almacenados en el fichero
	oBoards.Boards.forEach(element => {
		aModelos.push(element.name);
	});
	//Seleccionamos un chip
	const quickPick = await vscode.window.showQuickPick(aModelos, { canPickMany: false, placeHolder: 'Seleccionar modelo' });
	//Añadimos al array de salida el modelo de chip
	aSalida.push(quickPick);
console.log(quickPick);	
	//Recorremos el json con las chip  
	for (var nPosicion in oBoards.Boards) {
		//cuando encontramos el bloque correpondiente al modelo seleccionado
		if (oBoards.Boards[nPosicion].name == quickPick) {
			//Añadimos al arrau de salida el fqbn
			aSalida.push(oBoards.Boards[nPosicion].configuracion.fqbn);
console.log(oBoards.Boards[nPosicion].configuracion.fqbn);			
			//generamos la variable configuracion con todos los parametros de configuracion para la compilacion
			let cConfiguracion = `xtal=${oBoards.Boards[nPosicion].configuracion.xtal},`;
			cConfiguracion = cConfiguracion +`vt=${oBoards.Boards[nPosicion].configuracion.vt},`;
			cConfiguracion = cConfiguracion + `exception=${oBoards.Boards[nPosicion].configuracion.exception},`;
			cConfiguracion = cConfiguracion + `ssl=${oBoards.Boards[nPosicion].configuracion.ssl},`;
			cConfiguracion = cConfiguracion + `ResetMethod=${oBoards.Boards[nPosicion].configuracion.ResetMethod},`;
			cConfiguracion = cConfiguracion + `CrystalFreq=${oBoards.Boards[nPosicion].configuracion.CrystalFreq},`;
			cConfiguracion = cConfiguracion + `FlashFreq=${oBoards.Boards[nPosicion].configuracion.FlashFreq},`;
			cConfiguracion = cConfiguracion + `FlashMode=${oBoards.Boards[nPosicion].configuracion.FlashMode},`;
			cConfiguracion = cConfiguracion + `eesz=${oBoards.Boards[nPosicion].configuracion.eesz},`;
			cConfiguracion = cConfiguracion + `sdk=${oBoards.Boards[nPosicion].configuracion.sdk},`;
			cConfiguracion = cConfiguracion + `ip=${oBoards.Boards[nPosicion].configuracion.ip},`;
			cConfiguracion = cConfiguracion + `dbg=${oBoards.Boards[nPosicion].configuracion.dbg},`;
			cConfiguracion = cConfiguracion + `lvl=${oBoards.Boards[nPosicion].configuracion.lvl},`;
			cConfiguracion = cConfiguracion + `wipe=${oBoards.Boards[nPosicion].configuracion.wipe},`;
			cConfiguracion = cConfiguracion + `baud=${oBoards.Boards[nPosicion].configuracion.baud}`;
			//Añadimos al array de salida el string con la configuracion
			aSalida.push(cConfiguracion);
console.log(cConfiguracion);			
		}
	}
	return (aSalida);
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	console.log('Congratulations, your extension "serverpic" is now active!');

	vscode.commands.registerCommand("serverpic.new", async () => {

		console.log(`Comando Serverpic.new`);

		window.showInformationMessage('Bienvenido a Serverpic 1.0');

		//		await vscode.commands.executeCommand("arduino.initialize");
	});
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
