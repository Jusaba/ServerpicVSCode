'use strict';
const vscode = require("vscode")

const fs = require('fs');

const thisWorkspace = vscode.workspace.workspaceFolders[0].uri.toString();
var DirectorioTrabajo = `${thisWorkspace}`;
console.log (DirectorioTrabajo);
DirectorioTrabajo = (DirectorioTrabajo.toString()).replace('%20', ` `);
console.log (DirectorioTrabajo);
DirectorioTrabajo = (DirectorioTrabajo.toString()).replace('file:///', ``);
console.log (DirectorioTrabajo);
DirectorioTrabajo = (DirectorioTrabajo.toString()).replace('%3A', ':');
console.log (DirectorioTrabajo);


//const DirectorioTrabajo = `${thisWorkspace}/${newReactFolder}`;
//const DirectorioVscode = `${thisWorkspace}/${newReactFolder}/.vscode`;



//oServerpicJson = fs.readFileSync ()

exports.DirWork = async function ()
{

    var outChannel = vscode.window.createOutputChannel('Serverpic');
	outChannel.clear();
	outChannel.appendLine(`${DirectorioTrabajo}/.vscode/serverpic.json`);
	
    /*
    let uriJson = vscode.Uri.file(`${DirectorioTrabajo}/.vscode/serverpic.json`);                                           //Establecemos el path de la plantilla TeamCity
    let oServerpicJson = vscode.workspace.openTextDocument(uriJson);                                                      //Cargamos la plantilla TeamCity
    let cServerpicJson = (( await oServerpicJson).getText());                                                                   //Extraemos el texto de la plantilla    
    */

    
    //await LeeDir (DirectorioTrabajo);

    //var fServerpicJson = fs.readFileSync (`D:/Repositorios/Domo/Esp8266/Modulos Especificos/viento/.vscode/serverpic.json`);
    var fServerpicJson = fs.readFileSync (`${DirectorioTrabajo}/.vscode/serverpic.json`);
    outChannel.appendLine(fServerpicJson);
    var oServerpicJson = JSON.parse(fServerpicJson);
     outChannel.appendLine(oServerpicJson);
     var oServerpicJson = JSON.stringify(fServerpicJson);
     outChannel.appendLine(oServerpicJson);

     outChannel.show();
}    


async function LeeDir (cDirectorio)
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
	console.log (cDirTot);
} 