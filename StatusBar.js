const vscode = require("vscode")

//Barra de estado para Serverpic
const statusBarServerpic = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);			    //Titulo
const statusBarCom = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);					//COM
const statusBarBaudios = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);				//Baudios
const statusBarModelo = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);				//Modelo de micro

exports.statusBarServerpic; 
exports.statusBarCom; 
exports.statusBarBaudios; 
exports.statusBarModelo;

/**************************
* Funcion que crea la barra de estado de serverpic
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
exports.LeeBoard = async function ()
{
    return (statusBarModelo.text);
}
/**************************
* Registra un COM en la barra de estado
*/
exports.GrabaCom = async function (cCOM)
{
    statusBarCom.text = cCOM;
    statusBarCom.show();
}
/**************************
* Registra el dato de Baudios en la barra de estado
*/
exports.GrabaBaudios = async function (cBaudios)
{
    statusBarBaudios.text = cBaudios;
    statusBarBaudios.show();
}
/**************************
* Registra la Boars en la barra de estado
*/
exports.GrabaBoard = async function (cBoard)
{
    statusBarModelo.text = cBoard;
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
* Visualiza la barra de estado Board
*/
exports.ShowBoard = async function ()
{
    return (statusBarModelo.show());
}