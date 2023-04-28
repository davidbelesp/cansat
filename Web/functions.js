function presion(p0, tActual, altitud){
    //presion en pasacles y devuelve en pascales
    return p0*Math.exp(altitud*9.80665*0.0289644/8.31432*(tActual+273))
}

function altitud(t0, tactual){
    return (t0-tactual)*(100/0.65);
}