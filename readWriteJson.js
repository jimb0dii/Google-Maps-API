let fs = require('fs'),
    simplify = require('simplify-js');

let setData = input => {
    let obj = {};
    obj['lng'] = input[0];
    obj['lat'] = input[1];
    return obj;
}

let convertData = (input,multiplier) => {
    return input.map(element => {
        let obj = {};
        obj.x = element.lng * multiplier;
        obj.y = element.lat * multiplier;
        return obj;
    });
}

let returnData = (input,multiplier) => {
    return input.map(element => {
        let obj = {};
        obj.x = element.x / multiplier;
        obj.y = element.y / multiplier;
        return obj;
    });
}

let renameData = input => {
    return input.map(element => {
        let obj = {};
        obj['lng'] = element.x;
        obj['lat'] = element.y;
        return obj;
    });
}

fs.readFile('provinces.json', (error, data) => {
    if (error) throw error;
    
    data = JSON.parse(data);
    let minified = [];
    let simplified = [];
    const precision = 1000000;
    const tolerance = 5000;
    
    data.features.forEach(content => {
        if (content.geometry.type === "Polygon") {
            let points = content.geometry.coordinates[0].map(point => setData(point));
            let original = convertData(points, precision);
            let edited = simplify(original, tolerance, false);
            let result = renameData(returnData(edited, precision));
            
            simplified.push({[content.properties['PROVINCE']]: result});
            minified.push({
                [content.properties['PROVINCE']]: points,
                "type": content.geometry.type
            });
        } else {
            let points = content.geometry.coordinates.map(coords => coords[0].map(point => setData(point)));
            let original = points.map(element => convertData(element, precision));
            let edited = original.map(element => simplify(element, tolerance, false));
            let result = edited.map(element => renameData(returnData(element, precision)));
            
            simplified.push({[content.properties['PROVINCE']]:  result});
            minified.push({
                [content.properties['PROVINCE']]: points,
                "type": content.geometry.type
            });
        }   
    })

    fs.writeFile(`provMinified.json`, JSON.stringify(minified), error => {
        if (error) throw error;
        console.log('provMinified Generated');
    })
    
    fs.writeFile(`provSimplified.json`, JSON.stringify(simplified), error => {
        if (error) throw error;
        console.log('provSimplified Generated');
    })
})