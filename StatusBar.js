/**
******************************************************
* @file StatusBar.js
* @brief Gestion de la barra de estado de la extension de VSCode Serverpic
* @author Julian Salas Bartolome
* @version 1.0
* @date Noviembre 2022
*
* Se exportan las variables que contienen las barras y las funciones de lectura, grabacion y visualizacion del contenido de la barra
* En la grabacion, se incluye la actualizacion en .vscode/serverpic.json
* 
*******************************************************/
const vscode = require("vscode")
const JsonServerpic = require('./ServerpicJson.js');

//Creacion de la barra de estado para Serverpic
const statusBarServerpic = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);			//Titulo
const statusBarCom = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);					//COM
const statusBarBaudios = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);				//Baudios
const statusBarModelo = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);				//Modelo de micro

//Exportacion de las barras
exports.statusBarServerpic; 
exports.statusBarCom; 
exports.statusBarBaudios; 
exports.statusBarModelo;

/**************************
* Funcion que asigna a la barra de estado de serverpic los datos iniciales
* y asigna las funciones de gestion a cada barra
*
*/
exports.StatusBarServerpic = async function  ()
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
	statusBarCom.tooltip = 'Selecciona Serial Port';
	statusBarCom.show();			
	
	//Barra Baudios
	let myCommandBaudiosSel = {};
	myCommandBaudiosSel.title = 'SerialPortSel';
	myCommandBaudiosSel.command = 'serverpic.BaudiosSel';

	statusBarBaudios.text = "Baudios";
	statusBarBaudios.command = myCommandBaudiosSel;
	statusBarBaudios.tooltip = "Selecciona Baudios",
	statusBarBaudios.show();			

	//Barra modelo micro
	let myCommandModeloSel = {};
	myCommandModeloSel.title = 'ModeloSel';
	myCommandModeloSel.command = 'serverpic.ModeloSel';

	statusBarModelo.text = "Modelo";
	statusBarModelo.command = myCommandModeloSel;
	statusBarModelo.tooltip = "Selecciona Modelo",
	statusBarModelo.show();			
}
/**************************
* Devuelve el COM resgistrado en la barra de estado
*/
exports.LeeCom = async function ()
{
    return (statusBarCom.text);
}
/**************************
* Devuelve el dato de Baudios resgistrado en la barra de estado
*/
exports.LeeBaudios = async function ()
{
    return (statusBarBaudios.text);
}
/**************************
* Devuelve el dato de Board resgistrado en la barra de estado
*/
exports.LeeModelo = async function ()
{
    return (statusBarModelo.text);
}
/**************************
* Registra un COM en la barra de estado y la graba en .vscode/serverpic.json
*/
exports.GrabaCom = async function (cCOM)
{
    statusBarCom.text = cCOM;
	JsonServerpic.GrabaParamJson('com', cCOM);
    statusBarCom.show();
}
/**************************
* Registra el dato de Baudios en la barra de estado y la graba en .vscode/serverpic.json
*/
exports.GrabaBaudios = async function (cBaudios)
{
    statusBarBaudios.text = cBaudios;
	JsonServerpic.GrabaParamJson('baudios', cBaudios);
    statusBarBaudios.show();
}
/**************************
* Registra la Boars en la barra de estado y la graba en .vscode/serverpic.json
*/
exports.GrabaModelo = async function (cModelo)
{
    statusBarModelo.text = cModelo;
	JsonServerpic.GrabaParamJson('modelo', cModelo);
    statusBarModelo.show();
}
/**************************
* Visualiza la barra de estado COM
*/
exports.ShowCom = async function ()
{
    return (statusBarCom.show());
}
/**************************
* Visualiza la barra de estado Baudios
*/
exports.ShowBaudios = async function ()
{
    return (statusBarBaudios.show());
}
/**************************
* Visualiza la barra de estado Modelo
*/
exports.ShowModelo = async function ()
{
    return (statusBarModelo.show());
}