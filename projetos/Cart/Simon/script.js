let des0 = document.getElementById("des0")
let des1 = document.getElementById("des1")
let des2 = document.getElementById("des2")
let des3 = document.getElementById("des3")
let bu1 = document.getElementById("bu1")
let bu2 = document.getElementById("bu2")
let bu3 = document.getElementById("bu3")
let bu4 = document.getElementById("bu4")
let des4 = document.getElementById("des4")


let link = document.getElementById("link")





function linhaA() {
    des1.style.display = "block"
bu1.style.display = "none"
bu2.style.display = "none"
link.style.display = "block"
}

 
function linhaB() {
    des2.style.display = "block"
bu1.style.display = "none"
bu2.style.display = "none"
bu3.style.display = "inline"
bu4.style.display = "inline"

    
    
}

function linhaB2() {
    
bu3.style.display = "none"
bu4.style.display = "none"
des3.style.display = "block"
}


function linhaB3() {
        
bu3.style.display = "none"
bu4.style.display = "none"
des4.style.display = "block"

}