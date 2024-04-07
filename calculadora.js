function analizar() {
    let asoma = document.getElementById("numerosomaA").value;
    let bsoma = document.getElementById("numerosomaB").value;
    let p = document.getElementById("resultado");
    
    // Converter os valores para números
    let a = parseFloat(asoma);
    let b = parseFloat(bsoma);

    // Realizar a soma
    let s = a + b;

    // Atualizar o conteúdo do elemento p
    p.innerHTML = `A soma entre ${a} e ${b} é igual a ${s}`;
}




function resolver() {
    let asub = document.getElementById ("numerosubA").value
    let bsub = document.getElementById ("numerosubB").value
    let p = document.getElementById ("respostaSUB")

    let c = parseInt(asub)
    let d = parseInt(bsub)

    let sub = c - d
    p.innerHTML = `a subtração de ${c} e ${d}e igual a ${sub}`
    
}


function multiplicar() {
    let amulti = document.getElementById("numeromultiA").value
    let bmulti = document.getElementById("numeromultiB").value
    let p = document.getElementById("respostamulti")

    let e = parseFloat(amulti)
    let f = parseFloat(bmulti)

    let multi = e * f
    p.innerHTML = `a mutiplicação de ${e} e ${f}e igual a ${multi}`
}

function dividir() {
    let adiv = document.getElementById("numerodivA").value
    let bdiv = document.getElementById("numerodivB").value
    let p = document.getElementById("respostadiv")

    let g = parseFloat(adiv)
    let h = parseFloat(bdiv)

    let div = g / h
    p.innerHTML = `a mutiplicação de ${g} e ${g}e igual a ${div}`
}


    


    

