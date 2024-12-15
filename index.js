const http = require('http');
const fs = require('fs/promises');
const { v4: uuidv4 } = require('uuid');

const archivoAnime = 'anime.json'

http.createServer(async (req, res) => {
    const { searchParams, pathname } = new URL(req.url, `http://${req.headers.host}`);
    const params = new URLSearchParams(searchParams);
    if (req.method == 'GET') {
        const id = params.get('id');
        try {
            const lecturaArchivo = await fs.readFile(archivoAnime, 'utf-8');
            res.write(lecturaArchivo || "El archivo está vacío");
        } catch (error) {
            res.write('El archivo no existe o no se puede leer');
        }
        res.end();
    }
    if (req.method == 'POST') {
        try {
            let archivoOriginales = {};
            try {
                const archivoData = await fs.readFile(archivoAnime, 'utf-8');
                archivoOriginales = JSON.parse(archivoData)
            } catch (error) {
                archivoOriginales = {}
            }
            let datosAnime = '';

            req.on('data', (data) => {
                datosAnime += data;
            });

            req.on('end', async () => {
                try {
                    const nuevoAnime = JSON.parse(datosAnime);
                    const id = uuidv4();

                    archivoOriginales[id] = nuevoAnime;
                    await fs.writeFile(archivoAnime, JSON.stringify(archivoOriginales, null, 2));
                    res.end('Anime agregado exitosamente');
                } catch (error) {
                    res.end('Error al procesar los datos recibidos')
                }
            })
        } catch (error) {
            res.end('Error al procesar la solicitud')
        }
    }
    if (req.method == 'PUT') {
        try {
            const id = searchParams.get('id');
            console.log('ID recibido:', id);
            const datosArchivo = await fs.readFile(archivoAnime, 'utf-8');
            const objetoArchivoOriginal = JSON.parse(datosArchivo);
            
            let datosRecibidos = '';

            req.on('data', (data) => {
                datosRecibidos += data;
            });
            req.on('end', async () => {
                try {
                    const datosModificados = JSON.parse(datosRecibidos);
                    const animeOriginal = objetoArchivoOriginal[id];
                    if(animeOriginal) {
                        const animeActualizado = {...animeOriginal, ...datosModificados};
                        objetoArchivoOriginal[id] = animeActualizado; 
                        await fs.writeFile(archivoAnime, JSON.stringify(objetoArchivoOriginal, null, 2));
                        res.end('Anime actualizado exitosamente');
                    } else {
                        res.end('El anime con el id especificado no existe');
                    }                    
                } catch (error) {
                    res.end('Error al procesar los datos recibidos')
                }
            });
        } catch(error){
            res.end('Error al procesar la solicitud')
        }
    }
    if (req.method == 'DELETE') {
        try {
            const autosOriginales = await fs.readFile(archivoAnime, 'utf-8');
            const objetoArchivoOriginal = JSON.parse(autosOriginales);
            const id = params.get('id');
            if (objetoArchivoOriginal[id]) {
                delete objetoArchivoOriginal[id];
                await fs.writeFile(archivoAnime, JSON.stringify(objetoArchivoOriginal, null, 2));
                res.write('El anime ha sido eliminado exitosamente');
            } else {
                res.write('El anime con el id especificado no existe');
            }
            res.end();
        } catch (error) {
            res.write('Error al procesar la solicitud');
            res.end();
        }
    }
})
    .listen(3000, function () {
        console.log('Servidor iniciando en puerto 3000');
    });