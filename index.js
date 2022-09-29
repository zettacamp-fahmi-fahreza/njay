
function getVal(){
    const fname = document.getElementById("fname").value;
    const lname = document.getElementById("lname").value;
    const male = document.getElementById("male").value;
    const female = document.getElementById("female").value;
    const telephone = document.getElementById("telephone").value;
    const website = document.getElementById("website").value;
    const borndate = document.getElementById("borndate").value;
    const file = document.getElementById("file").value;
    document.getElementById("first").innerHTML = fname;
    document.getElementById("last").innerHTML = lname;

    const checkMale =document.getElementById('male').checked;
    if(checkMale == true){

    document.getElementById("showGender").innerHTML = male;
    }else{
        document.getElementById("showGender").innerHTML = female;
    };
    


    document.getElementById("showTelephone").innerHTML = telephone;

    document.getElementById("showWebsite").innerHTML = website;

    document.getElementById("showBorndate").innerHTML = borndate;
    
    document.getElementById("showImg").innerHTML = file;
};

function getVal2(){

    const biography = document.getElementById("biography").value;
    document.getElementById("showBiogpraphy").innerHTML = biography;


    const email = document.getElementById("email").value;
    const age = document.getElementById("age").value;

    document.getElementById("showAge").innerHTML = age;

    document.getElementById("showEmail").innerHTML = email;
}
