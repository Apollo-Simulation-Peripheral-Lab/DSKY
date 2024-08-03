import * as fs from 'fs';
import * as path from 'path';

export const getSettings = () =>{
    // Construct the file path
    const filePath = path.resolve('ha_settings.json');

    // Read the file synchronously
    try{
        const value = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(value)
    }catch{
        return {}
    }
}