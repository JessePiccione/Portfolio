const puppeteer = require('puppeteer');

dogbreeds = []
const scrape = async () =>{
    const browser = await puppeteer.launch({headless : false}); //browser initiate
    const page = await browser.newPage();  // opening a new blank page
    await page.goto('https://en.wikipedia.org/wiki/List_of_dog_breeds', {waitUntil : 'domcontentloaded'}) // navigate to url and wait until page loads completely

    // Selected table by aria-label instead of div id
    const recordList = await page.$$eval('id="mw-content-text"',(breeds)=>{
        list = []    
        breeds.forEach(row => {
             // (tr < th < a) anchor tag text contains country name
                const lilist = Array.from(row.querySelectorAll('li'), column => column.innerText); // getting textvalue of each column of a row and adding them to a list.
                console.log(lilist)
            });
        return;
    })
   
};
scrape();
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
document.getElementById('emailForm').addEventListener('click',postChecker);
function postChecker(event){
    var req = new XMLHttpRequest();
    var response;
    var payload = {email: null, message: null};

    if((payload.email = document.getElementById('email').value) ==  '' || payload.email == null){
        alert("Email is empty!");
        return;
    }
    if((payload.message = document.getElementById('textContent').value) ==  '' || payload.message == null){
        alert("Message is empty!");
        return;
    }
    console.log(payload);

    req.open('POST', 'http://httpbin.org/post', true);
    req.setRequestHeader('Text-Content', 'application/json');
    req.addEventListener('load', function(){
        if(req.status >= 200 && req.status < 400){
            response = JSON.parse(JSON.parse(req.responseText).data);
            document.getElementById('postdump').innerHTML = "<b>Your Email:</b><br /><div style = 'color: blue;'>"+response.email+ "</div><br /><b>Your Message:</b><br /><div style = 'color: red;'>"+response.message+"</div>";
            document.getElementById('postdump').style.display = 'block';
        }
        else{
            console.log('Error in Network Request'+req.statusText);
        }
    });
    req.send(JSON.stringify(payload));
    event.preventDefault();

}
