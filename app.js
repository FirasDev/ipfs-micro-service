const ipfsClient = require('ipfs-http-client');
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require('fs');


const ipfsServer = "https://ipfs.io/ipfs/"
const localServer = "http://127.0.0.1:8080/ipfs/"


//configuration
const ipfs = ipfsClient('http://localhost:5001');
const app = express();


//initialization
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.json());
app.use(fileUpload());

//routes
app.get('/', (req, res) => {
    res.render('Home');
});

/// Upload Data[Text] TO IPFS SERVER 
// ---> Return Hash Link 
// ------> 

app.post('/ipfsDatatextUpload', async (req, res) => {
    
    const id_owner = req.body.id;
    const data = req.body.data;

    var fileName = '';
    if (req.body.type == '1') {
        fileName = id_owner + '.notes.txt';
    } else {
        fileName = id_owner + '.pres.txt';
    }
    console.log(fileName);
    const filePath = 'files/' + fileName;
    fs.writeFile(filePath, data, async function (err) {
        if (err) {
            return console.log(err);
        }
        console.log('The file has been saved!');
        try {
            const fileHash = await addFile(fileName, filePath);
            fs.unlink(filePath, (err) => {
                if (err) console.log(err);
            });
            //res.render('upload', { fileName, fileHash });
            const json = '{"dataType": "Text" , "local": "'+localServer+fileHash+'",' +'"ipfsServer": "'+ipfsServer+fileHash+'"}';
            console.log(json);
            const obj = JSON.parse(json);
            res.status(201).send(obj);
        } catch (err) {
            console.log('Error : failed to download file');
            console.log(err);
            return res.status(500).send(err);
        }
    });
});


/// Upload Data[File] TO IPFS SERVER 
// ---> Return Hash Link 
// ------> 
app.post('/ipfsDataFileUpload', async (req, res) => {
    
    const id_owner = req.body.id;
    const file = req.files.file;
    const fileName = id_owner +"."+ file.name;  
    const filePath = 'files/' + fileName;
    console.log(fileName);

    file.mv(filePath, async (err) => {
        try {
            const fileHash = await addFile(fileName, filePath);
            fs.unlink(filePath, (err) => {
                if (err) console.log(err);
            });
            // res.render('upload', { fileName, fileHash });
            const json = '{"dataType": "Object" , "local": "'+localServer+fileHash+'",' +'"ipfsServer": "'+ipfsServer+fileHash+'"}';
            console.log(json);
            const obj = JSON.parse(json);
            res.status(201).send(obj);
        } catch (err) {
            console.log('Error : failed to download file');
            console.log(err);
            return res.status(500).send(err);
        }
    });


});

const addFile = async (fileName, filePath) => {
    const file = fs.readFileSync(filePath);
    const fileAdded = await ipfs.add({ path: fileName, content: file });
    console.log(fileAdded[0]);
    return fileAdded[0].hash;
}


app.listen(4000, () => {
    console.log('Server is listening on port 4000');
});
