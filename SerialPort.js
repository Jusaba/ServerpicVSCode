/**
******************************************************
* @file SerialPort.js
* @brief Gestion de los puertos serie para  la extension de VSCode Serverpic
* @author Julian Salas Bartolome
* @version 1.0
* @date Noviembre 2022
*
* Se exporta la funcion para seleccionar un puerto y para seleccionar una velocidad
*
* 
* Funciones exportadas
* --------------------
* async LeePuertos().- Función exportada para listar y seleccionar un puerto
* async BaudioSel().- Función para configurar la velocidad de un puerto
*
* Funciones internas 
* ------------------
* 
* async PuertosToArray().- Funcion interna que lee los guarda en un array que manda a BrowseSerialPort () para seleccionar uno. Es llamada por la exportada LeePuertos()
* async BrowseSerialPort (aPuertos).- Funcion que recibe una array con los puertos instalados, deja seleccionar uno y lo refleja en la barra de estado
* async SerialPortConfig (cPuerto).- Funcion que lee la configuracion de un puerto y actualiza la barra de estado con los baudios configurados
* async CheckC ().- Funcion que comprueba si en la barra de estado hay un COM y una velocidad distintas de COM y Baudios
*******************************************************/
const { Console } = require("console");
const vscode = require("vscode")


const BarraEstado = require ('./StatusBar.js');

var SerialPortSelected;

/**************************
* Funcion que lee los puertos serie conectados
*/
exports.LeePuertos = async function ()
{

	var outChannel = vscode.window.createOutputChannel('Serverpic');
//	outChannel.clear();
	outChannel.appendLine("Leyendo Puertos Serie");
	outChannel.show();


	await PuertosToArray();
	vscode.commands.executeCommand('workbench.action.terminal.focus');
}


/**************************
* Funcion que lee la cantidad de puertos y los guarda en un array
* Con el array llama a BrowseSerialPort (aPuertos) que es la función que deja seleccionar un puerto y actualiza la barra de estado
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
			if ( SerialPortSelectedOld == undefined)
			{
				await BarraEstado.GrabaCom ( 'COM' );
			}else{	
				await BarraEstado.GrabaCom ( SerialPortSelectedOld );
			}	
		}else{
			await BarraEstado.GrabaCom ( SerialPortSelected );
		}	
		SerialPortConfig(await BarraEstado.LeeCom());
		await BarraEstado.ShowCom();		
}


/**************************
* Funcion que lee los datos de configuracion de un puerto serie
*
*@param cPuerto.- Puerto del que se requiere la indformacion
*/
async function SerialPortConfig (cPuerto)
{
	var lExisteCom = 0
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
				BarraEstado.GrabaBaudios(cBaudios);			//Actualizamos la barra de baudios con el nuevo texto
				lExisteCom = 1;
				//aPuertos.push ( aPuertosTmp [0]);			//Añadimos a aPuertos el puerto leido
			}
		});
		if ( lExisteCom == 0)								//Si no hay informacion de baudios en la informacion recibida
		{							
			vscode.window.showErrorMessage(`No se puede leer la configuracion de ese puerto!`);	//Informamos del error
			BarraEstado.GrabaBaudios('Baudios');		//Borramos la velocidad de la barra de estado y en el Json 
			BarraEstado.GrabaCom('COM');				//Borramos el COM por que no es valido
		}
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
* Funcion para seleccionar la velodicad del puerto serie, configura el puerto con la velocidad seleccionada y actualiza la barra de estado
*
*/
exports.BaudioSel = async function () {
	var cPuerto= await BarraEstado.LeeCom();
	const aBaudios = ["300", "1200", "2400", "4800", "9600", "19200", "38400", "57600", "74880", "115200", "230400", "250000"];			//Array de velocidades permitidas
	var BaudiosSelected = await vscode.window.showQuickPick(aBaudios, { canPickMany: false, placeHolder: 'Seleccionar Velocidad' });	//Seleccion velocidad
	const { spawn } = require('node:child_process');																					//Ejecutamos shell mode para asignar velocidad al puerto
	const bat = await spawn('cmd.exe', ['/c', 'mode '+cPuerto+ ' '+BaudiosSelected]);
	
    console.log('mode '+cPuerto+ ' '+BaudiosSelected);
	//Si se recibe error
	bat.stderr.on('data', (data) => {
		vscode.window.showErrorMessage(`No se ha podido configurar el puerto!`);														//Informamos en barra de error
	});
	//Si se ejecuta el shell
	bat.on('exit', (code) => {																											
		console.log(`En BaudioSel, Child exited with code ${code}`);
		if ( code == 0)																													//Si la salida es correcta
		{
			BarraEstado.GrabaBaudios(BaudiosSelected);		
			//vscode.commands.executeCommand('workbench.action.terminal.sendSequence', { "text": "code $(git diff --no-commit-id --name-only -r HEAD) -r\u000D" });
		}else{																															//Si la salida es incorrecta
			vscode.window.showErrorMessage('Error en BaudioSel ');												    //Notificamos el error
			BarraEstado.GrabaBaudios("Baudios");																							//En la barra de estado no ponemos velocidad, ponemos Baudios
		}	
	});			
}

/**************************
* Funcion que comrpueba que en la barra de estado hay un com y una velocidad seleccionadas
*
*/
 exports.CheckCOM = async function ()
{
	var lSalida = false;
	var cPuerto = BarraEstado.LeeCom();
	var cBaudios = BarraEstado.LeeBaudios();
	if ( cPuerto != 'COM' && cBaudios != 'Baudios')
	{
		lSalida = true;
	}	
	return lSalida;
}