const cUsuario = require('os').homedir();
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const { window } = require("vscode")
const vscode = require("vscode")
const fs = require('fs');
//const { homedir } = require("os");

//Configuracion directorios
//Se debe estudiar si esto se permite configurar desde la configuracion de la extension
const cPathExtension = `${cUsuario}\\.vscode\\extensions\\serverpic`
const DirectorioPackages = `${cUsuario}\\AppData\\Local\\Arduino15\\packages`;


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

			cConfiguracion = cConfiguracion.substring(0, cConfiguracion.length - 1);
			//Añadimos al array de salida el string con la configuracion
			aSalida.push(cConfiguracion);
		}
	}
	return (aSalida);
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {


	let disposable = vscode.commands.registerCommand("serverpic.new", async () => {



		window.showInformationMessage('Bienvenido a Serverpic 1.0');
		const FolderExtension = `${cUsuario}\\.vscode\\extensions\\serverpic`;
		const newReactFolder = await window.showInputBox({ placeHolder: 'Teclee nombre de dispositivo' })
		const Placa = await window.showInputBox({ placeHolder: 'Teclee nombre de la placa a utilizar' })

		//Seleccionamos plataforma y determinamos la version del compilador instalado
		let cPlataforma = await Plataforma();
		let cVersionPlataforma = await VersionPlataforma(cPlataforma);
		//Seleccionamos el modelo de placa
		let aDatosPlataforma = await ModeloPlataforma(cPlataforma);
		let cModelo = aDatosPlataforma[0];

		let Fecha = new Date();
		Fecha = Fecha.toLocaleDateString();
		const we = new vscode.WorkspaceEdit();
		const thisWorkspace = vscode.workspace.workspaceFolders[0].uri.toString();
		const DirectorioTrabajo = `${thisWorkspace}/${newReactFolder}`;
		const DirectorioVscode = `${thisWorkspace}/.vscode`;
console.log("---------------------------------------------------");
console.log(DirectorioTrabajo);
console.log(thisWorkspace);
		// definimos los ficheros a incluir
		let TeamCity = vscode.Uri.parse(`${DirectorioTrabajo}/TeamCity.sh`);                                                        // TeamCity.sh
		let ino = vscode.Uri.parse(`${DirectorioTrabajo}/${newReactFolder}.ino`);                                                   // Ino
		let IO = vscode.Uri.parse(`${DirectorioTrabajo}/IO.h`);                                                                     // IO.H
		let Serverpic = vscode.Uri.parse(`${DirectorioTrabajo}/Serverpic.h`);                                                      // Serverpic.h
		let boardlist = vscode.Uri.parse(`${DirectorioTrabajo}/boardlist.sh`);                                                      // Serverpic.h
		let hardware = vscode.Uri.parse(`${DirectorioTrabajo}/hardware`);
		let arduinojson = vscode.Uri.parse(`${DirectorioVscode}/arduino.json`);
		let compila = vscode.Uri.parse(`${DirectorioTrabajo}/Compila.bat`);
		let upload = vscode.Uri.parse(`${DirectorioTrabajo}/Upload.bat`);
		

		let newFiles = [TeamCity, ino, IO, Serverpic, boardlist, hardware, arduinojson, compila, upload];                                                                             // Creamos array de ficheros
		for (const newFile of newFiles) { we.createFile(newFile, { ignoreIfExists: false, overwrite: true }) };

		//-------------------
		//Fichero TeamCity.sh
		//-------------------
		let uriTeamCity = vscode.Uri.file(`${FolderExtension}/Plantillas/TeamCity.s_`);                                           //Establecemos el path de la plantilla TeamCity
		let oTeamCityTexto = vscode.workspace.openTextDocument(uriTeamCity);                                                     //Cargamos la plantilla TeamCity
		let TeamCityTexto = ((await oTeamCityTexto).getText());                                                                   //Extraemos el texto de la plantilla    
		TeamCityTexto = (TeamCityTexto.toString()).replace('#Dispositivo#', `${newReactFolder}`);                                  //Hacemos los remplazos pertinentes
		we.insert(TeamCity, new vscode.Position(0, 0), TeamCityTexto);                                                             //Grabamos la informacion en TeamCity.sh
		vscode.commands.executeCommand('workbench.action.closeActiveEditor');                                                     //Cerramos el fichero abierto en workspace
	
		//-------------------
		//Fichero IO.h
		//-------------------
			let uriIO = vscode.Uri.file(`${FolderExtension}/Plantillas/IO.h_`);                                                       //Establecemos el path de la plantilla IO
		let oIOTexto = vscode.workspace.openTextDocument(uriIO);                                                                 //Cargamos la plantilla IO
		let IOTexto = ((await oIOTexto).getText());                                                                               //Extraemos el texto de la plantilla    
		IOTexto = (IOTexto.toString()).replace('#Placa#', `${Placa}`);                                                             //Hacemos los remplazos pertinentes
		IOTexto = (IOTexto.toString()).replace('#Dispositivo#', `${newReactFolder}`);
		IOTexto = (IOTexto.toString()).replace('#Fecha#', `${Fecha}`);
		we.insert(IO, new vscode.Position(0, 0), IOTexto);                                                                         //Grabamos la informacion en IO.h
		vscode.commands.executeCommand('workbench.action.closeActiveEditor');                                                     //Cerramos el fichero abierto en workspace
 		
		//-------------------
		//Fichero Serverpic.h
		//-------------------			
		let uriServerpic = vscode.Uri.file(`${FolderExtension}/Plantillas/Serverpic.h_`);                                         //Establecemos el path de la plantilla Serverpic
		let oServerpicTexto = vscode.workspace.openTextDocument(uriServerpic);                                                   //Cargamos la plantilla Serverpic
		let ServerpicTexto = ((await oServerpicTexto).getText());                                                                 //Extraemos el texto de la plantilla    
		ServerpicTexto = (ServerpicTexto.toString()).replace('#Placa#', `${Placa}`);                                               //Hacemos los remplazos pertinentes
		ServerpicTexto = (ServerpicTexto.toString()).replace('#Placa#', `${Placa}`);
		ServerpicTexto = (ServerpicTexto.toString()).replace('#Placa#', `${Placa}`);
		ServerpicTexto = (ServerpicTexto.toString()).replace('#Modelo#', `${cModelo}`);
		ServerpicTexto = (ServerpicTexto.toString()).replace('#Dispositivo#', `${newReactFolder}`);
		ServerpicTexto = (ServerpicTexto.toString()).replace('#Fecha#', `${Fecha}`);
		ServerpicTexto = (ServerpicTexto.toString()).replace('#Ino#', `${newReactFolder}${Placa}`);
		ServerpicTexto = (ServerpicTexto.toString()).replace('#Core#', `${cVersionPlataforma}`);
		we.insert(Serverpic, new vscode.Position(0, 0), ServerpicTexto);                                                           //Grabamos la informacion en Serverpic.h
		vscode.commands.executeCommand('workbench.action.closeActiveEditor');                                                     //Cerramos el fichero abierto en workspace

		//-------------------
		//Fichero *.ino
		//-------------------
		let uriIno = vscode.Uri.file(`${FolderExtension}/Plantillas/Ino.in_`);                                                    //Establecemos el path de la plantilla TeamCity
		let oInoTexto = vscode.workspace.openTextDocument(uriIno);                                                               //Cargamos la plantilla TeamCity
		let InoTexto = ((await oInoTexto).getText());                                                                             //Extraemos el texto de la plantilla    
		InoTexto = (InoTexto.toString()).replace('#Dispositivo#', `${newReactFolder}`);                                            //Hacemos los remplazos pertinentes
		InoTexto = (InoTexto.toString()).replace('#Dispositivo#', `${newReactFolder}`);                                            //Hacemos los remplazos pertinentes
		InoTexto = (InoTexto.toString()).replace('#Fecha#', `${Fecha}`);
		we.insert(ino, new vscode.Position(0, 0), InoTexto);                                                                       //Grabamos la informacion en el prigrama ino
		vscode.commands.executeCommand('workbench.action.closeActiveEditor');                                                     //Cerramos el fichero abierto en workspace

		//---------------------
		//Fichero boardlsit.sh
		//---------------------	
		let uriBoardlist = vscode.Uri.file(`${FolderExtension}/Plantillas/boardlist.s_`);                                                    //Establecemos el path de la plantilla TeamCity
		let oBoardlistTexto = vscode.workspace.openTextDocument(uriBoardlist);                                                               //Cargamos la plantilla TeamCity
		let BoardlistTexto = ((await oBoardlistTexto).getText());                                                                             //Extraemos el texto de la plantilla    
		BoardlistTexto = (BoardlistTexto.toString()).replace('#Dispositivo#', `${newReactFolder}`);                                            //Hacemos los remplazos pertinentes
		BoardlistTexto = (BoardlistTexto.toString()).replace('#Dispositivo#', `${newReactFolder}`);                                            //Hacemos los remplazos pertinentes
		BoardlistTexto = (BoardlistTexto.toString()).replace('#Dispositivo#', `${newReactFolder}`);                                            //Hacemos los remplazos pertinentes
		BoardlistTexto = (BoardlistTexto.toString()).replace('#Fecha#', `${Fecha}`);
		we.insert(boardlist, new vscode.Position(0, 0), BoardlistTexto);                                                                       //Grabamos la informacion en el prigrama ino
		vscode.commands.executeCommand('workbench.action.closeActiveEditor');

		//-------------------
		//Fichero hardware
		//-------------------
		we.insert(hardware, new vscode.Position(0, 0), `${newReactFolder}`);

		//----------------------------------
		//Generamos el fichero arduino.json
		//----------------------------------
		let oJson =
		{
			"sketch": `${newReactFolder}\\${newReactFolder}.ino`,
			"configuration": `${aDatosPlataforma[2]}`,
			"board": `${aDatosPlataforma[1]}`,
			"output": `${newReactFolder}\\build`
		};
		let DataJson = JSON.stringify(oJson);
		we.insert(arduinojson, new vscode.Position(0, 0), DataJson);
		//vscode.window.showTextDocument(oTeamCityTexto)

		//-------------------
		//Fichero Compila
		//-------------------
		we.insert(compila, new vscode.Position(0, 0), `arduino-cli compile -b ${aDatosPlataforma[1]}:${aDatosPlataforma[2]} --build-path %~d0%~p0build -e -v `);

		//-------------------
		//Fichero Upload
		//-------------------
		we.insert(upload, new vscode.Position(0, 0), `arduino-cli upload -p %1 -b ${aDatosPlataforma[1]} -i %~d0%~p0build/${aDatosPlataforma[1]}/${newReactFolder}.ino.bin `);

		await vscode.workspace.applyEdit(we);                                                                                       // apply all the edits: file creation and adding text
		for (const newFile of newFiles) { let document = await vscode.workspace.openTextDocument(newFile); await document.save(); };

		//		await vscode.commands.executeCommand("arduino.initialize");
	});
	let disposable1 = vscode.commands.registerCommand("serverpic.hello", async () => {
		//Creamos un canal para escribir en la consola de salida con el nombre Serverpic
		var outChannel = vscode.window.createOutputChannel('Serverpic');
		outChannel.clear();
		outChannel.appendLine("[Start] Compilando");
		
		const Directoriotrabajo = vscode.workspace.workspaceFolders[0].uri.toString();
		
		outChannel.appendLine(Directoriotrabajo);
		//Preparamos para ejecutar el bat
		const { spawn } = require('node:child_process');
		const bat = spawn('cmd.exe', ['/c', 'D:/Repositorios/Domo/Prueba/viento/Compila.bat']);

		bat.stdout.on('data', (data) => {
  			console.log(data.toString());
			outChannel.appendLine("1.-");
			outChannel.appendLine(data.toString());
		});

		bat.stderr.on('data', (data) => {
  			console.error(data.toString());
			outChannel.appendLine("2.-");
			outChannel.appendLine(data.toString());
		});

		bat.on('exit', (code) => {
  			console.log(`Child exited with code ${code}`);
			outChannel.appendLine("3.-");
			outChannel.appendLine(code.toString());
		});
		console.log("Hola Julian");
		console.log( `${Directoriotrabajo}`);
		outChannel.show();

	})
	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable1);
}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
