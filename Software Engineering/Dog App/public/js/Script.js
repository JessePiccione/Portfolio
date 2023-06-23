

//carousel affect stuff
//assigning buttons left and right 
document.getElementById('right').addEventListener('click',function(){
    setImage(1);
});
document.getElementById('left').addEventListener('click',function(){
    setImage(-1);
});
//assigning indicators
var indicators = document.getElementsByClassName('chinga');
setIndicators();
//starting to ring around the rosie    
var mySlideIndex = 0;
ringAroundTheRosie();
//functions to perform transitions from one item to another
function setImage(x){
    mySlideIndex+=x;
    var images = document.getElementsByClassName('bigchungus');
    if(mySlideIndex >= images.length) {mySlideIndex = 0;}
    if(mySlideIndex < 0){mySlideIndex = images.length-1;}
    var i = 0;
    for(i = 0; i < images.length; i++){
        images[i].style.display = 'none';
    }
    images[mySlideIndex].style.display = 'block';
}
//auto matic transition function
function ringAroundTheRosie(){
    setImage(1);
    setTimeout(ringAroundTheRosie,7000);
}
//for indicator buttons
function indicate(n){
    mySlideIndex = n;
    setImage(0);
}
// function to set indicators using simaler solution to the fix closure loop problem
function setIndicators(){
    for(var x = 0; x < indicators.length; x++){
        indicators[x].addEventListener('click', function(){
            var temp = x;
            return function(){indicate(temp)}; 
        }()
        );
    }
}
//post checker event default 
document.getElementById('emailForm').addEventListener('click',emailMe);
function emailMe(event){
    var response;
    var payload = {email: null, message: null};

    payload.email = document.getElementById('email').value
    payload.message = document.getElementById('textContent').value
    if((payload.email) ==  '' || payload.email == null){
        alert("Email is empty!");
    }
    if((payload.message) ==  '' || payload.message == null){
        alert("Message is empty!");
    }
    
    bigThunder(payload);
    event.preventDefault();

}
function bigThunder(payload){
    Email.send({
        Host: "smtp.gmail.com",
        Username : "jessepiccione@gmail.com",
        Password : "Scott5596!",
        To : 'piccionj@oregonstate.edu',
        From : "jessepiccione@gmail.com",
        Subject : payload.email,
        Body : payload.message,
        }).then(
            message => alert("mail sent successfully")
        );
}
var something = {email:"testemail", message:"this is a test if you see this you win"}
