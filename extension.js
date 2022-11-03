
const cUsuario = require('os').homedir();
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const { window } = require("vscode")
const vscode = require("vscode")
const fs = require('fs');
const { Console } = require('console');
//const { homedir } = require("os");
const port = require ('./SerialPOrt.js');


//Configuracion directorios
//Se debe estudiar si esto se permite configurar desde la configuracion de la extension
const cPathExtension = `${cUsuario}\\.vscode\\extensions\\serverpic`
const DirectorioPackages = `${cUsuario}\\AppData\\Local\\Arduino15\\packages`;

var SerialPortSelected;

var aBoard;

//Barra de estado para Serverpic
const statusBarServerpic = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);			//Titulo
const statusBarCom = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);					//COM
const statusBarBaudios = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);				//Baudios
const statusBarModelo = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);				//Modelo de micro

async function LeeDirectorio (cDirectorio)
{
	var cDirTot = '';
	var cDirInd = '';

	cDirTot = cDirTot+'\t\t\t\t'+'\"'+(cDirectorio.substring(0, cDirectorio.length - 1))+'\",'+'\n';	//Directorio contenedor
	let files = fs.readdirSync(cDirectorio)																//Leemos el contenido del directorio
	files.forEach(file => {																			//Recorremos el contenido
		cDirInd = cDirectorio+file;																	//Añadimos todo el path al objetivo
		var stat = fs.statSync(cDirInd)																//Miramos de que tipo es el objetivo 
		if (stat.isDirectory())																		//Si es un directorio
		{
			if (fs.existsSync(cDirInd+'/src'))														//Miramos si en el hay otro directorio src
			{
				cDirTot = cDirTot+'\t\t\t\t'+'\"'+cDirInd+'/src\",'+'\n';							//Si lo hay agragamos el directorio src
			}else{
				cDirTot = cDirTot+'\t\t\t\t'+'\"'+cDirInd+'\",'+'\n';								//Si no, el directorio original
			}
		}
	})
	return (cDirTot);
} 

async function Create_Intellisense (cModelo, cDirUsuario, cPlataforma, cVersion)
{
	var cListaLib = '';
	/*
	const thisWorkspace = vscode.workspace.workspaceFolders[0].uri.toString();
	const DirectorioTrabajo = `${thisWorkspace}/${newReactFolder}`;
	const DirectorioVscode = `${thisWorkspace}/${newReactFolder}/.vscode`;
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
	cDirectorio = `${cDirUsuario}/Documentos/Arduino/libraries/`
	cListaLib =   cListaLib + await LeeDirectorio(cDirectorio);
	cListaLib = cListaLib.substring(0, cListaLib.length-2); 
                    
	return(cListaLib);
} 
function CheckCOM ()
{
	var lSalida = false;
	var cPuerto = statusBarCom.text;
	var cBaudios = statusBarBaudios.text;
	if ( cPuerto != 'COM' && cBaudios != 'Baudios')
	{
		lSalida = true;
	}	
	console.log (cPuerto);
	console.log (cBaudios);
	console.log('Salida: ');
	console.log(lSalida);
	return lSalida;
}
function CheckBoard()
{	var lSalida = false;
	var cBoard = statusBarModelo.text;
	if ( cBoard != 'Board')
	{
		lSalida = true;
	}
	return lSalida;	

}
async function Upload ()
{
	if (CheckCOM () == true)
	{
		if ( CheckBoard() == true)
		{
			var cPath = vscode.workspace.workspaceFolders[0].uri.toString();
			var aTexto = cPath.split('/');
			var cFile = aTexto[aTexto.length-1]+".ino.bin";
			var cUpload = `arduino-cli upload -p ${statusBarCom.text} -b ${aBoard[3]} -i build/`+cFile;
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

	if (CheckBoard () == true)
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
	var cPuerto = statusBarCom.text;
	var cBaudios = statusBarBaudios.text;
	if (CheckCOM () == true)
	{
		var cTerminal = "arduino-cli monitor -p "+cPuerto+" -c baudrate="+cBaudios+ " -c bits=8 -c parity=none -c stop_bits=1 -c dtr=off -c rts=off"	;																	//Ponemos en la barra de estado la nueva velocidad
		vscode.commands.executeCommand('workbench.action.terminal.focus');
		vscode.commands.executeCommand('workbench.action.terminal.sendSequence', { "text": cTerminal  +'\n' });
	}else{
		vscode.window.showErrorMessage('Se debe seleccionar puerto valido');
	}

}

/**************************
* Funcion que crea la barra de estado de serverpic
*
*/
async function StatusBarServerpic ()
{
	//Barra titulo	
	statusBarServerpic.text = "|| Serverpic ";
	statusBarServerpic.show();			
	//Barra Com
	let myCommandSerialPortSel = {};
	myCommandSerialPortSel.title = 'SerialPortSel';
	myCommandSerialPortSel.command = 'serverpic.SerialPortSel';
	
	statusBarCom.text = "COM";
	statusBarCom.command = myCommandSerialPortSel;
	statusBarCom.tooltip = 'Sel Serial Port';
	statusBarCom.show();			
	
	//Barra Baudios
	let myCommandBaudiosSel = {};
	myCommandBaudiosSel.title = 'SerialPortSel';
	myCommandBaudiosSel.command = 'serverpic.BaudiosSel';

	statusBarBaudios.text = "Baudios";
	statusBarBaudios.command = myCommandBaudiosSel;
	statusBarBaudios.tooltip = "Baudios Sel",
	statusBarBaudios.show();			

	//Barra modelo micro
	let myCommandBoardSel = {};
	myCommandBoardSel.title = 'SerialBoardSel';
	myCommandBoardSel.command = 'serverpic.BoardSel';

	statusBarModelo.text = "Board";
	statusBarModelo.command = myCommandBoardSel;
	statusBarModelo.tooltip = "Board Sel",
	statusBarModelo.show();			


}

/**************************
* Funcion para seleccionar la velodicad del puerto serie
*
*/
async function BaudioSel () {
	var cPuerto=statusBarCom.text;
	const aBaudios = ["300", "1200", "2400", "4800", "9600", "19200", "38400", "57600", "74880", "115200", "230400", "250000"];			//Array de velocidades permitidas
	var BaudiosSelected = await vscode.window.showQuickPick(aBaudios, { canPickMany: false, placeHolder: 'Seleccionar Velocidad' });	//Seleccion velocidad
	const { spawn } = require('node:child_process');																					//Ejecutamos shell mode para asignar velocidad al puerto
	const bat = await spawn('cmd.exe', ['/c', 'mode '+cPuerto+ ' '+BaudiosSelected]);
	
	//Si se recibe error
	bat.stderr.on('data', (data) => {
		vscode.window.showErrorMessage(`No se ha podido configurar el puerto!`);														//Informamos en barra de error
	});
	//Si se ejecuta el shell
	bat.on('exit', (code) => {																											
		console.log(`Child exited with code ${code}`);
		if ( code == 0)																													//Si la salida es correcta
		{
			statusBarBaudios.text=BaudiosSelected;		
			//vscode.commands.executeCommand('workbench.action.terminal.sendSequence', { "text": "code $(git diff --no-commit-id --name-only -r HEAD) -r\u000D" });
		}else{																															//Si la salida es incorrecta
			vscode.window.showErrorMessage('Error en BaudioSel ' + data.toString());												    //Notificamos el error
			statusBarBaudios.text = "Baudios";																							//En la barra de estado no ponemos velocidad, ponemos Baudios
		}	
	});			
}

/**************************
* Funcion que lee los datos de configuracion de un puerto serie
*
*@param cPuerto.- Puerto del que se requiere la indformacion
*/
async function SerialPortConfig (cPuerto)
{
	const { spawn } = require('node:child_process');					//Leemos la configuracion del puerto con shelll mode			
	const bat = await spawn('cmd.exe', ['/c', 'mode '+cPuerto]);
	//Si se ejecuta el shell tratamos los datos recibidos
	bat.stdout.on('data', (data) => {
		var cTexto = data.toString();						//Asignamos a cTexto lo que se recibe del comando
		var aLineas = cTexto.split('\n');					//Troceamos y extraemos las lineas
		aLineas.forEach(function(cLinea, cIndex)			//Recorremos las lineas
		{
			if ( cLinea.indexOf("Baudios:") > -1)			//Si tiene informacion de Baudios
			{
				var aBaudios = cLinea.split(':');			//Troceamos la linea con separador :
				var cBaudios = aBaudios[1].trim();			//Quitamos los espacios del segundo termino que es el que contiene el COM
				statusBarBaudios.text = cBaudios;			//Actualizamos la barra de baudios con el nuevo texto
				statusBarBaudios.show();					
				//aPuertos.push ( aPuertosTmp [0]);			//Añadimos a aPuertos el puerto leido
			}else{											//Si no hay informacion de baudios en la informacion recibida
				vscode.window.showErrorMessage(`No se puede leer la configuracion de ese puerto!`);	//Informamos del error
			}
		});
	});
	//Si se produce error en la ejecucion del Shell
	bat.stderr.on('data', (data) => {
		vscode.window.showErrorMessage('Error en SerialPortConfig ' + data.toString());										//Informamos en barra de error
	});
	//Si se ha ejecutado el shell
	bat.on('exit', (code) => {
		console.log(`Child exited with code ${code}`);
	});	
}


/**************************
* Funcion que permite seleccionar un puerto y los refleja en statusBarCom
*
*@param aPuertos.- Array con los puertos detectdos en la máquina
*/
async function BrowseSerialPort (aPuertos)
{
        var SerialPortSelectedOld = SerialPortSelected;
		SerialPortSelected = await vscode.window.showQuickPick(aPuertos, { canPickMany: false, placeHolder: 'Seleccionar Puerto' });	
		if (SerialPortSelected == undefined)
		{
			statusBarCom.text = SerialPortSelectedOld;
		}else{
			statusBarCom.text = SerialPortSelected;
		}			
		SerialPortConfig(statusBarCom.text);
		statusBarCom.show();		
}
/**************************
* Funcion que lee la cantidad de puertos serie ocupados y deja seleccionar uno
*/
async function  PuertosToArray ()
{
	var aPuertos = [];
	const { spawn } = require('node:child_process');							//Ejecutamos un shel serialport-list ( orden cli preinstalada )
	const bat = await spawn('cmd.exe', ['/c', 'serialport-list -f text']);
	//https://serialport.io/docs/bin-list
	//Si se recibe informacion del shell
	bat.stdout.on('data', (data) => {
		var cTexto = data.toString();						//Asignamos a cTexto lo que se recibe del comando
		var aLineas = cTexto.split('\n');					//Troceamos y extraemos las lineas
		aLineas.forEach(function(cPuerto, cIndex)			//Recorremos las lineas
		{
			if ( cPuerto.indexOf('COM') > -1)				//Si tiene informacion de un COM
			{
				var aPuertosTmp = cPuerto.split('\t');		//Troceamos la linea con separador tabulacion
				aPuertos.push ( aPuertosTmp [0]);			//Añadimos a aPuertos el puerto leido
			}
		});
	});
	//Si se produce un error en la ejecucion del shell
	bat.stderr.on('data', (data) => {
		vscode.window.showErrorMessage('Error en PuertosToArray ' + data.toString());				//Informamos en barra de error
	});
	bat.on('exit', (code) => {
		console.log(`Child exited with code ${code}`);
		BrowseSerialPort(aPuertos);
	});	
}


async function LeePuertos()
{
	var outChannel = vscode.window.createOutputChannel('Serverpic');
	outChannel.clear();
	outChannel.appendLine("Leyendo Puertos Serie");
	outChannel.show();
	
	//StatusBarServerpic();
	await PuertosToArray();
	vscode.commands.executeCommand('workbench.action.terminal.focus');
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
async function ListSerialPort ()
{
	const { spawn } = require('node:child_process');
	const bat = spawn('cmd.exe', ['/c', 'reg query HKLM\\HARDWARE\\DEVICEMAP\\SERIALCOMM']);
	
	bat.stderr.on('data', (data) => {
	  console.error(data.toString());
	  outChannel.appendLine("2.-");
	  outChannel.appendLine(data.toString());
	});

	bat.stdout.on('data', (data) => { 
		var cPorTxt = data.toString();
		//console.log(bat);
		let arrReg = cPorTxt.split("\n");
		let aPuertos;
		//if ( arr.indeOf('Device')>0)
		//{
		console.log(arrReg.length);
		//console.log(cPorTxt);
		console.log("***********");
		arrReg.forEach(function(cTexto, index) {
			if (cTexto.indexOf("Device")> 0)
			{
				console.log(`${index} : ${cTexto}`);
				let aCom=cTexto.split("COM");
				console.log("COM"+aCom[1]);
				aPuertos.push ("COM"+aCom[1]);
			}
		});
		aPuertos.forEach(function(cPuerto, index){
			console.log(cPuerto);
		})

	});	
}
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	StatusBarServerpic();

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
		let cModelo = aDatosPlataforma[2];

		let Fecha = new Date();
		Fecha = Fecha.toLocaleDateString();
		const we = new vscode.WorkspaceEdit();
		const thisWorkspace = vscode.workspace.workspaceFolders[0].uri.toString();
		const DirectorioTrabajo = `${thisWorkspace}/${newReactFolder}`;
		const DirectorioVscode = `${thisWorkspace}/${newReactFolder}/.vscode`;
		// definimos los ficheros a incluir
		let TeamCity = vscode.Uri.parse(`${DirectorioTrabajo}/TeamCity.sh`);                                                        // TeamCity.sh
		let ino = vscode.Uri.parse(`${DirectorioTrabajo}/${newReactFolder}.ino`);                                                   // Ino
		let IO = vscode.Uri.parse(`${DirectorioTrabajo}/IO.h`);                                                                     // IO.H
		let Serverpic = vscode.Uri.parse(`${DirectorioTrabajo}/Serverpic.h`);                                                      // Serverpic.h
		let boardlist = vscode.Uri.parse(`${DirectorioTrabajo}/boardlist.sh`);                                                      // Serverpic.h
		let hardware = vscode.Uri.parse(`${DirectorioTrabajo}/hardware`);
		let serverpicjson = vscode.Uri.parse(`${DirectorioVscode}/serverpic.json`);
		let compila = vscode.Uri.parse(`${DirectorioTrabajo}/Compila.bat`);
		let upload = vscode.Uri.parse(`${DirectorioTrabajo}/Upload.bat`);
		let properties = vscode.Uri.parse(`${DirectorioVscode}/c_cpp_properties.json`);
		//Creamos un array de los ficheros y los creamos
		let newFiles = [TeamCity, ino, IO, Serverpic, boardlist, hardware, serverpicjson, compila, upload, properties];                                                                             // Creamos array de ficheros
		for (const newFile of newFiles) { we.createFile(newFile, { ignoreIfExists: false, overwrite: true }) };

		//-------------------
		//Fichero TeamCity.sh
		//-------------------
		let uriTeamCity = vscode.Uri.file(`${FolderExtension}/Plantillas/TeamCity.s_`);                                           //Establecemos el path de la plantilla TeamCity
		let oTeamCityTexto = vscode.workspace.openTextDocument(uriTeamCity);                                                      //Cargamos la plantilla TeamCity
		let TeamCityTexto = ((await oTeamCityTexto).getText());                                                                   //Extraemos el texto de la plantilla    
		//TeamCityTexto = (TeamCityTexto.toString()).replace('#Dispositivo#', `${newReactFolder}`);                                  //Hacemos los remplazos pertinentes
		TeamCityTexto = TeamCityTexto.split('#Dispositivo#').join(newReactFolder);												   //Hacemos los remplazos pertinentes
		we.insert(TeamCity, new vscode.Position(0, 0), TeamCityTexto);                                                             //Grabamos la informacion en TeamCity.sh
		vscode.commands.executeCommand('workbench.action.closeActiveEditor');                                                     //Cerramos el fichero abierto en workspace
	
		//-------------------
		//Fichero IO.h
		//-------------------
		let uriIO = vscode.Uri.file(`${FolderExtension}/Plantillas/IO.h_`);                                                       //Establecemos el path de la plantilla IO
		let oIOTexto = vscode.workspace.openTextDocument(uriIO);                                                                  //Cargamos la plantilla IO
		let IOTexto = ((await oIOTexto).getText());                                                                               //Extraemos el texto de la plantilla 
		IOTexto = IOTexto.split('#Placa#').join(Placa);   																		  //Hacemos los remplazos pertinentes	
		IOTexto = IOTexto.split('#Dispositivo#').join(newReactFolder); 
		IOTexto = IOTexto.split('#Fecha#').join(Fecha); 
//		IOTexto = (IOTexto.toString()).replace('#Placa#', `${Placa}`);                                                             //Hacemos los remplazos pertinentes
//		IOTexto = (IOTexto.toString()).replace('#Dispositivo#', `${newReactFolder}`);
//		IOTexto = (IOTexto.toString()).replace('#Fecha#', `${Fecha}`);
		we.insert(IO, new vscode.Position(0, 0), IOTexto);                                                                         //Grabamos la informacion en IO.h
		vscode.commands.executeCommand('workbench.action.closeActiveEditor');                                                     //Cerramos el fichero abierto en workspace
 		
		//-------------------
		//Fichero Serverpic.h
		//-------------------			
		let uriServerpic = vscode.Uri.file(`${FolderExtension}/Plantillas/Serverpic.h_`);                                         //Establecemos el path de la plantilla Serverpic
		let oServerpicTexto = vscode.workspace.openTextDocument(uriServerpic);                                                    //Cargamos la plantilla Serverpic
		let ServerpicTexto = ((await oServerpicTexto).getText());           													  //Extraemos el texto de la plantilla	
		ServerpicTexto = ServerpicTexto.split('#Placa#').join(Placa); 															  //Hacemos los remplazos pertinentes 	
		ServerpicTexto = ServerpicTexto.split('#Modelo#').join(cModelo);
		ServerpicTexto = ServerpicTexto.split('#Dispositivo#').join(newReactFolder);
		ServerpicTexto = ServerpicTexto.split('#Fecha#').join(Fecha);
		ServerpicTexto = ServerpicTexto.split('#Ino#').join(newReactFolder+Placa);    
		ServerpicTexto = ServerpicTexto.split('#Core#').join(cVersionPlataforma);                                                      
		//ServerpicTexto = (ServerpicTexto.toString()).replace('#Placa#', `${Placa}`);                                               
		//ServerpicTexto = (ServerpicTexto.toString()).replace('#Placa#', `${Placa}`);
		//ServerpicTexto = (ServerpicTexto.toString()).replace('#Placa#', `${Placa}`);
		//ServerpicTexto = (ServerpicTexto.toString()).replace('#Modelo#', `${cModelo}`);
		//ServerpicTexto = (ServerpicTexto.toString()).replace('#Dispositivo#', `${newReactFolder}`);
		//ServerpicTexto = (ServerpicTexto.toString()).replace('#Fecha#', `${Fecha}`);
		//ServerpicTexto = (ServerpicTexto.toString()).replace('#Ino#', `${newReactFolder}${Placa}`);
		//ServerpicTexto = (ServerpicTexto.toString()).replace('#Core#', `${cVersionPlataforma}`);
		we.insert(Serverpic, new vscode.Position(0, 0), ServerpicTexto);                                                           //Grabamos la informacion en Serverpic.h
		vscode.commands.executeCommand('workbench.action.closeActiveEditor');                                                     //Cerramos el fichero abierto en workspace

		//-------------------
		//Fichero *.ino
		//-------------------
		let uriIno = vscode.Uri.file(`${FolderExtension}/Plantillas/Ino.in_`);                                                    //Establecemos el path de la plantilla TeamCity
		let oInoTexto = vscode.workspace.openTextDocument(uriIno);                                                                //Cargamos la plantilla TeamCity
		let InoTexto = ((await oInoTexto).getText());                                                                             //Extraemos el texto de la plantilla   
		InoTexto = InoTexto.split('#Dispositivo#').join(newReactFolder);                                                          //Hacemos los remplazos pertinentes
		InoTexto = InoTexto.split('#Fecha#').join(Fecha); 
		//InoTexto = (InoTexto.toString()).replace('#Dispositivo#', `${newReactFolder}`);                                           //Hacemos los remplazos pertinentes
		//InoTexto = (InoTexto.toString()).replace('#Dispositivo#', `${newReactFolder}`);                                           
		//InoTexto = (InoTexto.toString()).replace('#Fecha#', `${Fecha}`);
		we.insert(ino, new vscode.Position(0, 0), InoTexto);                                                                       //Grabamos la informacion en el prigrama ino
		vscode.commands.executeCommand('workbench.action.closeActiveEditor');                                                     //Cerramos el fichero abierto en workspace

		//---------------------
		//Fichero boardlsit.sh
		//---------------------	
		let uriBoardlist = vscode.Uri.file(`${FolderExtension}/Plantillas/boardlist.s_`);                                                    //Establecemos el path de la plantilla TeamCity
		let oBoardlistTexto = vscode.workspace.openTextDocument(uriBoardlist);                                                               //Cargamos la plantilla TeamCity
		let BoardlistTexto = ((await oBoardlistTexto).getText());                                                                             //Extraemos el texto de la plantilla    
		BoardlistTexto = BoardlistTexto.split('#Dispositivo#').join(newReactFolder);                                                          //Hacemos los remplazos pertinente
		BoardlistTexto = BoardlistTexto.split('#Fecha#').join(Fecha);
		//BoardlistTexto = (BoardlistTexto.toString()).replace('#Dispositivo#', `${newReactFolder}`);                                            //Hacemos los remplazos pertinentes
		//BoardlistTexto = (BoardlistTexto.toString()).replace('#Dispositivo#', `${newReactFolder}`);                                            //Hacemos los remplazos pertinentes
		//BoardlistTexto = (BoardlistTexto.toString()).replace('#Dispositivo#', `${newReactFolder}`);                                            //Hacemos los remplazos pertinentes
		BoardlistTexto = (BoardlistTexto.toString()).replace('#Fecha#', `${Fecha}`);
		we.insert(boardlist, new vscode.Position(0, 0), BoardlistTexto);                                                                       //Grabamos la informacion en el prigrama ino
		vscode.commands.executeCommand('workbench.action.closeActiveEditor');

		//-------------------
		//Fichero hardware
		//-------------------
		we.insert(hardware, new vscode.Position(0, 0), `${newReactFolder}`);

		//----------------------------------
		//Generamos el fichero serverpic.json
		//----------------------------------
		let oJson =
		{
			"sketch": `${newReactFolder}\\${newReactFolder}.ino`,
			"plataforma": `${aDatosPlataforma[0]}`,
			"version": `${cVersionPlataforma}`,
			"board": `${aDatosPlataforma[2]}`,
			"fqbn": `${aDatosPlataforma[3]}`,
			"configuration": `${aDatosPlataforma[4]}`,
			"compilador": `${aDatosPlataforma[5]}`,
			"dircompilador": `${aDatosPlataforma[6]}`,
			"output": `${newReactFolder}\\build`
		};
		let DataJson = JSON.stringify(oJson);
		we.insert(serverpicjson, new vscode.Position(0, 0), DataJson);
	
		//-------------------
		//Fichero Compila
		//-------------------
		we.insert(compila, new vscode.Position(0, 0), `arduino-cli compile -b ${aDatosPlataforma[3]}:${aDatosPlataforma[4]} --build-path %~d0%~p0build -e -v `);

		//-------------------
		//Fichero Upload
		//-------------------
		we.insert(upload, new vscode.Position(0, 0), `arduino-cli upload -p %1 -b ${aDatosPlataforma[3]} -i %~d0%~p0build/${aDatosPlataforma[3]}/${newReactFolder}.ino.bin `);

		//-------------------
		//Fichero c_cpp_properties
		//-------------------
		let cDirUsuario = (`${cUsuario}`.toString()).replace('\\', '/');
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
		LeePuertos();
	});	
	let disposable3 = vscode.commands.registerCommand("serverpic.BaudiosSel", async () => {
		BaudioSel (); 
	});	
	let disposable4 = vscode.commands.registerCommand("serverpic.BoardSel", async () => {
		let cPlataforma = await Plataforma();
		let cVersionPlataforma = await VersionPlataforma(cPlataforma);
		//Seleccionamos el modelo de placa
		let aDatosPlataforma = await ModeloPlataforma(cPlataforma);
		statusBarModelo.text=aDatosPlataforma[2];
		aBoard = aDatosPlataforma;
	});	
	let disposable5 = vscode.commands.registerCommand("serverpic.compila", async () => {
		Compila (); 
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
