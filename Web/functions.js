//--------------------------

var REALTIME = false;
var intervalo;

//--------------------------


function presion(tActual, altitud){
    P0 = 101325
    //presion en pasacles y devuelve en pascales
    return P0*Math.exp(altitud*9.80665*0.0289644/8.31432*(tActual+273))
}

function altitud(tactual){
    T0 = 27
    return (T0-tactual)*(100/0.65);
}

async function getData(){
    let data = await fetch("./api.php")
    data = await data.json()
    return data["datos"]
}

async function setGraph(){
    let datos = await getData()

    const graphDiv = document.querySelector(".graph")

    traces = []

    let prevNumber = null
    let actualNumber = null

    var traceX = []
    datos.forEach(element => {
        traceX.push(element["ID"])
    });

    let options = ["temp","angulo","humedad"]

    options.forEach((option) => {
        if(!prevNumber) prevNumber = datos[0][option]

        trace = {}
        traceY = []

        datos.forEach(dato => {
            actualNumber = dato[option]

            if(!(option == "angulo")){
                
                
                if(validateNumber(prevNumber,actualNumber))prevNumber = actualNumber;
                else actualNumber = prevNumber

            }

            traceY.push(actualNumber);
            
        });
        
        switch(option){
            case "temp":  trace["name"] = "Temperatura"
                break;
            case "humedad": trace["name"] = "Humedad"   
                break;
            case "humedad": trace["name"] = "Angulo"   
                break;
            default: trace["name"] = "Unknown" 
                break;
        }   

        trace["x"] = traceX
        trace["y"] = traceY

        traces.push(trace)

        prevNumber = null;

    })

    Plotly.newPlot( graphDiv, traces, layout );

    setSideNumbers(datos)
}

function setSideNumbers(datos){
    const humText = document.querySelector(".humedad")
    const tempText = document.querySelector(".temp")
    const riesgoText = document.querySelector(".riesgo")
    
    lastData = datos[datos.length-1]

    tempText.innerHTML = `${lastData["temp"]}°C`
    humText.innerHTML = `${lastData["humedad"]}%`
    riesgoText.innerHTML = `${lastData["angulo"]}%`
}

function validateNumber(prev,number){
    return !(Math.abs(prev-number) > 20)
}

function realTimeToggle(event){

    document.querySelector("")
    
    if(REALTIME){

        return clearInterval(intervalo);
    } 
    
    intervalo = setInterval(() => {
        setGraph();
        REALTIME = true;
    }, 2000);
}



var layout = {
    autosize: true,
    font:{
        family: 'Courier New, monospace',
        color:"000000"
    },
    legend:{
        x:1,
        y:0.5,
        bgcolor:"#00000000",
        font: {
            family: 'sans-serif',
            size: 12,
            color: '#000000'
            },
    },
    // width: 500,
    height: 300,
    margin: {
        l: 50,
        r: 10,
        b: 60,
        t: 30,
        pad: 20
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)'
};