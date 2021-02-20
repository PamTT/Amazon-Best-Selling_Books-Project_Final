// This program will read the Quotes CSV file and display quotes randomly on the screen.
function Selectquote(Selected_data) {
    let Author_name = Selected_data.Auther;
    let Sel_quote = Selected_data.quote;
    d3.select(".text1").text(Sel_quote);
    d3.select(".text2").text("-" + Author_name);
}; 

function changequote() {
    var quotes_number = 0;
    d3.csv("static/data/QUOTE.csv").then(function(Quotedata, err)
    {
    if (err) throw err;
    for (var i = 0; i < Quotedata.length; i++) 
    {
      quotes_number = Math.floor(Math.random() * (Quotedata.length));   
    };
    Selected_data = Quotedata[quotes_number];
    Selectquote(Selected_data)
    });
};
 
setInterval(function() {changequote();}, 6500);