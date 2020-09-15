var rank="";
var sub="";
var sub_price="";
function handleOpenURL(url) {
    var qr = url.slice(8);
    //alert(qr);
    var data = localStorage.getItem("LocalData");
    data = JSON.parse(data);
    data[data.length] = [moment().format('lll'), qr];
    localStorage.setItem("LocalData", JSON.stringify(data));
    location.href='index.html#display';
  }
function scanNow(){
    cordova.plugins.barcodeScanner.scan(
        function (result) {
            if(!result.cancelled) {
                // alert("We got a barcode\n" +
                //       "Result: " + result.text + "\n" +
                //       "Format: " + result.format + "\n" +
                //       "Cancelled: " + result.cancelled);
                var value = result.text;
                var data = localStorage.getItem("LocalData");
                data = JSON.parse(data);

                data[data.length] = [moment().format('lll'), value];
                localStorage.setItem("LocalData", JSON.stringify(data));
                //alert("Scan successful ");
                location.href='index.html#display';
            }
        },
        function (error) {
            alert("Scanning failed: " + error);
        },
        {
            preferFrontCamera : false, // iOS and Android
            showFlipCameraButton : true, // iOS and Android
            showTorchButton : true, // iOS and Android
            torchOn: false, // Android, launch with the torch switched on (if available)
            saveHistory: true, // Android, save scan history (default false)
            prompt : "Place a barcode inside the scan area", // Android
            resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
            formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
            orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
            disableAnimations : true, // iOS
            disableSuccessBeep: true // iOS and Android
        }
    );

}

if(localStorage.getItem("LocalData") == null)
{
    var data = [];
    data = JSON.stringify(data);
    localStorage.setItem("LocalData", data);
}


//what to display on the prescription page

$(document).on("pagebeforeshow", "#display", function() {
    $("table#allTable tbody").empty();

    var data = localStorage.getItem("LocalData");
    console.log(data);
    data = JSON.parse(data);
    //data = "66820faf4b4d79fecc19ed6cba0696a8"

    //let's see what all things we need to display in each prescription here

    var html = "";

    for(var count1 = 0; count1 < data.length; count1++)
    {
        var qrcode=data[count1][1];//store the qr code in this variable as a string
        //var requestUrl="http://192.168.43.105/sih/api/v2/qrcode/"+qrcode;
        // var requestUrl="http://sih.pbehre.in/api/v2/qrcode/"+qrcode;
        var requestUrl="https://emeds-white-hats.000webhostapp.com/api/v2/qrcode/"+qrcode;


        // alert("requestUrl :::::"+requestUrl);

        sendAjax(requestUrl,'GET',data,count1);

    }

});

//what to display on the prescription location page
//172.28.24.254/

$(document).on("pagebeforeshow", "#displayNew", function() {
    $("table#allTableNew tbody").empty();

    //let's see what all things we need to display in each prescription here

    //var requestUrl="http://192.168.43.105/sih/api/v2/qrcode/"+rank[1];
    // var requestUrl="http://sih.pbehre.in/api/v2/qrcode/"+rank[1];
    var requestUrl="https://emeds-white-hats.000webhostapp.com/api/v2/qrcode/"+rank[1];
    

    // alert(requestUrl);

    sendAjaxNew(requestUrl,'GET',data);

});

//ClearLocalStorage
function ClearLocalStorage(){
    localStorage.clear();
    window.location.reload();
}


// //Radio Button Module
// $(document).ready(function(){
//
//     $("#isSelect").click(function () {
//
//         var findThisStore=$('input:radio[name=finding]:checked').closest('td').text();
//         launchnavigator.navigate(findThisStore);
//
//     });
// });
//Radio Button ModuleNew
$(document).ready(function(){

    $("#isSelectNew").click(function () {

        var findThisStore=$('input:radio[name=finding]:checked').closest('td').text();
        launchnavigator.navigate(findThisStore);
    });
});


$(document).ready(function(){

    $("#isSelect").click(function () {

        var findThisIndex=$('input:radio[name=finding]:checked').closest('td').text();
        //sub = $('input:radio[name=sub]:checked').closest('td').text();
        sub = $('input:checkbox[name=sub]:checked').closest('td').map(function(){
            return $(this).text();
          }).get(); // <----
        sub_price = $('input:checkbox[name=sub]:checked').closest('td').next('td').map(function(){
            return $(this).text();
          }).get(); // <----
        console.log(sub_price);
        var trueIndex=findThisIndex-1;
        var data = localStorage.getItem("LocalData");
        console.log(data);
        data = JSON.parse(data);

        rank=data[trueIndex];
        location.href='index.html#displayNew';
        // launchnavigator.navigate(findThisStore);
    });
});


function sendAjax(url, method, data,count1) {
    //alert(url);
    $.ajax({
        type: method,
        crossDomain: true,
        url: url,
        data: data,
        success: function (response) {
            //alert(response);
            // alert("just below success function_alert3");
            var html="";

            var arrJSON=JSON.parse(response);
            // var arrJSON=response;
            var valuesArrForMedicine=showObject(arrJSON.medicines);
            var valuesArrForMedicinePrice=showObject(arrJSON.m_price);
            var valuesArrForSubstitutes=showObject(arrJSON.subtitutes);
            // alert("valuesArr::::::"+valuesArr[0]);
            var prescribedMedicine="";
            for(var i=0;i<valuesArrForMedicine.length;i++){
                prescribedMedicine+="<tr>" +
                    "<td>("+(i+1)+")&nbsp;&nbsp;"+valuesArrForMedicine[i]+"</td>" +
                    "<td>" +valuesArrForMedicinePrice[i]+ "</td></tr><tr><td>Substitutes | विकल्प:</td></tr>";
                    //bug fix for button group
                    //prescribedMedicine += "<fieldset id=\"sub\">";
                for(var j=0;j<valuesArrForSubstitutes[i].length;j++) {
                    //if(valuesArrForSubstitutes[i][j].name!=valuesArrForMedicine[i]) {
                        prescribedMedicine +="(" + (j + 1) + ")<tr><td><label style='border: 0px;width: 100%;'><input type='checkbox' name='sub' value='find'>" + valuesArrForSubstitutes[i][j].name + "</label></td>" +
                            "<td>" + valuesArrForSubstitutes[i][j].price + "</td></tr>";
                    //}
                }
               // prescribedMedicine += "</fieldset>";
                
            }
            // alert("display:::::"+display);
            //bug fix for button group
            //prescribedMedicine += "</form>";

            var storeAddress=arrJSON.stores_details["1"][0].name+", ";
            storeAddress+=arrJSON.stores_details["1"][0].address+", India";

            var valuesArrForStoresAvail=showObject(arrJSON.stores_av);
            var valuesArrForStoreDetails=showObject(arrJSON.stores_details);

            // var store1=[],store2=[],k=0,l=0;
            // var storesDetails=new Array([]);
            //
            // var storesDetails=[[],[]];
            // for(var i=0;i<valuesArrForStoresAvail.length;i++){
            //     for(var j=0;j<valuesArrForStoresAvail[i].length;j++){
            //         if(valuesArrForStoresAvail[i][j]==1){
            //             store1[k]=valuesArrForMedicine[i];
            //             k++;
            //         }
            //         else {
            //             store2[l]=valuesArrForMedicine[i];
            //             l++;
            //         }
            //     }
            // }
            // storesDetails[0].push(valuesArrForMedicine[0]);
            // storesDetails[1].push(valuesArrForMedicine[1]);
            // for(var i=0;i<valuesArrForStoresAvail.length;i++){
            //     for(var j=0;j<valuesArrForStoresAvail[i].length;j++){
            //         for(var m=0;m<valuesArrForStoreDetails.length;m++) {
            //             if (valuesArrForStoresAvail[i][j] == m+1) {
            //                 storesDetails[m].push(valuesArrForMedicine[i]);
            //             }
            //         }
            //     }
            // }
            //
            // var htmlRadioEdit=numberOfStores(showObject(arrJSON.stores_details),storesDetails);

            // alert(data[count1][0]);

            //alright so anything that is an address is to be placed with a radio button
            html+=

                + "<tr><td></td></tr>"
                + "<tr><td><label style='border: 0px;width: 10px;'>"+(count1+1)+"<input type='radio' name='finding' value='find'></label></td></tr>" +
                "<tr><td>"+ data[count1][0] + "</td></tr>"
                + "<tr><td>Name | नाम</td><td>Price | मूल्य</td></tr>"
                + prescribedMedicine;
                // + htmlRadioEdit;

            if(count1==data.length-1){
                html+="<tr/><td><br></td><tr/>";
            }
            $("#display table#allTable tbody").append(html).closest("table#allTable").table("refresh").trigger('create');


        },
        error: function (response) {
            return response;
        }
    });
}


function sendAjaxNew(url, method, data) {
    //alert(url);
    $.ajax({
        type: method,
        crossDomain: true,
        url: url,
        data: data,
        success: function (response) {
            //alert(response);
            // alert("just below success function_alert3");
            var html="";

            var arrJSON=JSON.parse(response);
            // var arrJSON=response;
            var valuesArrForMedicine=showObject(arrJSON.medicines);
            var valuesArrForMedicinePrice=showObject(arrJSON.m_price);
            // alert("valuesArr::::::"+valuesArr[0]);
            var prescribedMedicine="";
            
            // alert("display:::::"+display);

            var storeAddress=arrJSON.stores_details["1"][0].name+", ";
            storeAddress+=arrJSON.stores_details["1"][0].address+", India";

            var valuesArrForStoresAvail=showObject(arrJSON.stores_av);
            var valuesArrForStoreDetails=showObject(arrJSON.stores_details);

            var store1=[],store2=[],k=0,l=0;
            // var storesDetails=new Array([]);

            var storesDetails=[[],[]];
            // for(var i=0;i<valuesArrForStoresAvail.length;i++){
            //     for(var j=0;j<valuesArrForStoresAvail[i].length;j++){
            //         if(valuesArrForStoresAvail[i][j]==1){
            //             store1[k]=valuesArrForMedicine[i];
            //             k++;
            //         }
            //         else {
            //             store2[l]=valuesArrForMedicine[i];
            //             l++;
            //         }
            //     }
            // }
            // storesDetails[0].push(valuesArrForMedicine[0]);
            // storesDetails[1].push(valuesArrForMedicine[1]);
            for(var i=0;i<valuesArrForStoresAvail.length;i++){
                for(var j=0;j<valuesArrForStoresAvail[i].length;j++){
                    for(var m=0;m<valuesArrForStoreDetails.length;m++) {
                        if (valuesArrForStoresAvail[i][j] == m+1) {
                            storesDetails[m].push(valuesArrForMedicine[i]);
                        }
                    }
                }
            }
            var htmlRadioEdit=numberOfStores1(showObject(arrJSON.stores_details),storesDetails, sub, sub_price,arrJSON);

            html+=+ "<tr><td></td></tr>"
                +htmlRadioEdit;

            // if(count1==data.length-1){
            //     html+="<tr/><td><br></td><tr/>";
            // }
            $("#displayNew table#allTableNew tbody").append(html).closest("table#allTableNew").table("refresh").trigger('create');


        },
        error: function (response) {
            return response;
        }
    });
}

//sendRequestToTheApi
function sendAjaxGvs(url, method, data) {
    $.ajax({
        type: method,
        crossDomain: true,
        url: url,
        data: data,
        success: function (response) {
            // alert(arr.stores_details["1"][0].name);
            // // // var storeLat=arr.stores_details["1"][0].LAT;
            // // // var storeLon=arr.stores_details["1"][0].LON;
            // // // launchnavigator.navigate([storeLat,storeLon]);

            alert("gvs mei hu");
            var arrJSON=JSON.parse(response);
            var valuesArrForMedicine=showObject(arrJSON.medicines);
            var valuesArr=showObject(arrJSON.stores_av);
            alert(valuesArrForMedicine[0]);
            // var display="";
            // for(var i=0;i<valuesArr.length;i++){
            //     display+=valuesArr[i]+"\n";
            // }
            // alert(display);
            // findAddressForLaunchNavigatorPlugin(storeAddress);
        },
        error: function (response) {
            return response;
        }
    });
}

function getSum(total, num) {
    return total + num;
}

function numberOfStores1(valuesArrForStoreDetail,storesDetails, sub, sub_price, arrJSON) {
    var htmlRadioEdit="<thead><tr>" +
    "<th><strong>Medicines दवाई</strong></th> <th><strong>Price मूल्य<strong></th><th><strong>Quantity  मात्रा</strong></th><th><strong>Amount रकम</strong></th>"
    +"</tr>";
   
    var cons = arrJSON['pres_details']['consumption'];
    var no = arrJSON['pres_details']['number'];
    var dur = arrJSON['pres_details']['duration'];
    var total = [];
    for(var i=0;i<sub.length; i++) {
        var qty = calcQTY(cons[i], no[i], dur[i]);
        var amt = qty * sub_price[i];
        total.push(amt);
        htmlRadioEdit += "<tr><td>" + sub[i] + "</td><td>Rs. " + sub_price[i] + "</td><td>" + qty + "</td><td>Rs. " + amt + "</td></tr>";
    }
    var sum = total.reduce(getSum);
    htmlRadioEdit += "<tr><td colspan='3'><strong>Approximate Total <br>अनुमानित कुल : </strong></td><td>Rs. "+sum+"</td></tr>";
    for(var i=0;i<valuesArrForStoreDetail.length;i++) {
        var name = valuesArrForStoreDetail[i][0].name;
        var storeAddress=valuesArrForStoreDetail[i][0].name+", ";
        storeAddress+=valuesArrForStoreDetail[i][0].address+", India";
        htmlRadioEdit += "";
        htmlRadioEdit += "<tr>" +
            "<td colspan='4'><label>" + storeAddress + "<input type='radio' name='finding' value='find'></label></td>" +
            "</tr><br>"+
            "<tr>";
            /*if(valuesArrForStoreDetail[i+1][0].name == name) {
                break;
            }*/
        if(i==valuesArrForStoreDetail.length-1){
            htmlRadioEdit+="<tr style='border-bottom:4px solid black'><td colspan='100%'></td></tr><br><br><br>"
        }
    }
    return htmlRadioEdit;
}

function numberOfStores(valuesArrForStoreDetail,storesDetails) {
    var htmlRadioEdit="";
    for(var i=0;i<valuesArrForStoreDetail.length;i++) {
        var storeAddress=valuesArrForStoreDetail[i][0].name+", ";
        storeAddress+=valuesArrForStoreDetail[i][0].address+", India";

        htmlRadioEdit += "<tr>" +
            "<td><label>" + storeAddress + "<input type='radio' name='finding' value='find'></label></td>" +
            "</tr><br>"+
            "<tr>" +
            "<td><strong>Available Medicines:</strong> <br>"+storesDetails[i]+"</td>"
            +"</tr>";
        if(i==valuesArrForStoreDetail.length-1){
            htmlRadioEdit+="<tr style='border-bottom:4px solid black'><td colspan='100%'></td></tr><br><br><br>"
        }
    }
    return htmlRadioEdit;
}


//iterate thru a json object having key:value
function showObject(JSONobj) {
    var result = [];
    var it=0;
    for (var p in JSONobj) {
        if( JSONobj.hasOwnProperty(p) ) {
            // result = JSONobj[p];
            result[it]=JSONobj[p];
            it++;
        }
    }
    return result;
}

// experimentalpage

$(document).on("pagebeforeshow", "#experimentalPage", function() {
    $("table#allTable1 tbody").empty();

    var data = localStorage.getItem("LocalData");
    console.log(data);
    data = JSON.parse(data);

    var html = "";

    for(var count = 0; count < data.length; count++)
    {
        html = html
            + "<tr>"
            + "<td>" + data[count][0] + "</td>"
            + "<td>" + data[count][1] + " <button>Find</button></td>"
            + "</tr>";
    }

    $("table#allTable1 tbody").append(html).closest("table#allTable1").table("refresh").trigger("create");

});

$(document).on("pagebeforeshow", "#experimentalPage", function() {
    // $("table#allTable tbody").empty();
    //
    // var data = localStorage.getItem("LocalData");
    // console.log(data);
    // data = JSON.parse(data);
    //
    // var html = "";
    //
    // for(var count = 0; count < data.length; count++)
    // {
    //     html = html +
    //         "<tr>" +
    //         "<td>" + data[count][0] + "</td>" +
    //         "<td>" + data[count][1] + "<button onclick='locateNow()'>Find</button></td>" +
    //         //"<td></td>"
    //         +"</tr>";
    // }
    //
    // $("table#allTable tbody").append(html).closest("table#allTable").table("refresh").trigger("create");
    $('#customListviewPrescription').empty();

    var data = localStorage.getItem("LocalData");
    data = JSON.parse(data);

    var html="";

    $.each(data, function (i,item) {
        // $('#customListviewPrescription').append(
        //     "<li data-role='list-divider'>"+item[i,0]+"</li>"
        //     +" "+item[i,1]);
        // var $li=$("</li>").html(item[i,0]).appendTo($html);
        $("<li>").html(item[i,0]).data('role','list-divider').appendTo("#customListviewPrescription");
        // var $li = $("<li>").appendTo("#customListviewPrescription");
        // $("<a>")
    });

    $('#customListviewPrescription').listview('refresh');
});

function calcQTY(consumption, number, duration) {
    var cons;
    cons = {
        "Once in a day": 1,
        "Empty stomach": 1,
        "After breakfast": 1,
        "After lunch": 1,
        "Before lunch": 1,
        "After dinner": 1,
        "Before dinner": 1,
        "Twice daily after meal": 2,
        "Twice daily before meal": 2,
        "Thrice daily after meal": 3,
        "Thrice daily before meal": 3,
        "Four times daily after meal": 4,
        "Four times daily before meal": 4,
        "Once in a week": 1
    };
    var dur;
    dur = {
        "Days": 1,
        "Weeks": 7,
        "Months": 30
    };
    var dailyNo;
    dailyNo = cons[consumption];
    var qty;
    qty = dailyNo * number * dur[duration];
    return qty;
}