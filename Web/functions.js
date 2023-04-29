//--------------------------

var REALTIME = false;
var intervalo;

//--------------------------

function riesgo(temp,hum){
    let res;
    if(temp>28 && hum<30) res= ((Math.random() * 5) + 70)
    if(temp>28 && hum>30) res= ((Math.random() * 5) + 40)
    if(temp<28 && hum<30) res= ((Math.random() * 5) + 40)
    if(temp<28 && hum>30) res= ((Math.random() * 5) + 0)

    else res= ((Math.random() * 5) + 25)

    return Math.round(res*100)/100
}

function validateNumber(prev,number){
    return !(Math.abs(prev-number) > 20)
}

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

    let traces = []

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
            case "angulo": trace["name"] = "Angulo"   
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
    setTable(datos)
}

function setSideNumbers(datos){
    const humText = document.querySelector(".hum_number")
    const tempText = document.querySelector(".temp_number")
    const riesgoText = document.querySelector(".riesgo_number")
    
    lastData = datos[datos.length-1]

    riesgoN = riesgo(lastData["temp"],lastData["humedad"])

    tempText.innerHTML = `${lastData["temp"]}°C`
    humText.innerHTML = `${lastData["humedad"]}%`
    riesgoText.innerHTML = `${riesgoN}%`
}



function realTimeToggle(event){

    const indicator = document.querySelector(".rt-indicator")

    indicator.classList.toggle("active")
    indicator.classList.toggle("not-active")
    
    if(REALTIME){
        return clearInterval(intervalo);
    } 
    
    intervalo = setInterval(() => {
        setGraph();
        REALTIME = true;
    }, 2000);
}


function setTable(datos){

    
    const table = document.querySelector(".table-data")

    table.innerHTML = ""
    

    datos.forEach((dato) => {
        newTableRow = document.createElement("tr")

        newIDData = document.createElement("td")
        newTempData = document.createElement("td")
        newHumData = document.createElement("td")
        newAnguloData = document.createElement("td")

        newIDData.innerHTML = dato["ID"]
        newTempData.innerHTML = dato["temp"]
        newHumData.innerHTML = dato["humedad"]
        newAnguloData.innerHTML = dato["angulo"]

        newTableRow.appendChild(newIDData)
        newTableRow.appendChild(newTempData)
        newTableRow.appendChild(newHumData)
        newTableRow.appendChild(newAnguloData)
        table.appendChild(newTableRow)
    })
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