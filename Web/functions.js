//--------------------------

var REALTIME = false;
var intervalo;

//--------------------------

function riesgo(temp,hum){
    const numeroHtml = document.querySelector(".riesgo_number")

    let risk=(((temp + ((100-hum)/2)))/100)**2;
    risk=Math.round(risk*100);

    if(risk<40) numeroHtml.style.color = "#009933"
    if(risk>=40 && risk<60) numeroHtml.style.color = "#ffff00"
    if(risk>=60 && risk<75) numeroHtml.style.color = "#ff6600"
    if(risk>=75) numeroHtml.style.color = "#ff0000"

    return risk;
}

function validateNumber(prev,number){
    return !(Math.abs(prev-number) > 20)
}

function validateMaxMin(number,max,min){
    if(number > max || number < min) return "N/A" 
    return number
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
            } else {
                actualNumber = angleToDegrees(actualNumber)
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

    let riesgoN = riesgo(lastData["temp"],lastData["humedad"])

    tempText.innerHTML = `${lastData["temp"]}°C`
    humText.innerHTML = `${lastData["humedad"]}%`
    riesgoText.innerHTML = `${riesgoN}%`
}


function angleToDegrees(angle){
    const A0 = 7.22 //1300 = 180 degrees - 7.22/degree
    return (Math.round((angle/A0/2)*100)/100)*-1
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

        newIDData.innerHTML = `${dato["ID"]}`
        newTempData.innerHTML = `${validateMaxMin(dato["temp"],50,5)}°C`
        newHumData.innerHTML = `${validateMaxMin(dato["humedad"],100,0)}%`
        newAnguloData.innerHTML = `${angleToDegrees(dato["angulo"])}°`

        

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