/**
 * @author Rakesh
 */

//Global Variables
var gv_username, gv_password;
var session = null;
var isOnline = null;

var newDate = new Date();
var dd = newDate.getDate();
var mm = newDate.getMonth() + 1;
var yyyy = newDate.getFullYear();
var today = mm + '/' + dd + '/' + yyyy;
//End

$(document).delegate('#cut', 'pagebeforeshow', function() {
	$('#details_list').listview('refresh');
});

$(document).delegate('#orders', 'pagebeforeshow', function() {
	$('#order_list').listview('refresh');
});

$(document).delegate('#orders,#cut', 'pageinit', function() {
	if (session != "S") {
		$.mobile.changePage("#loginform", "fade");
	}
});

$(document).delegate('#orders,#cut,#loginfail,#menu', 'pageshow', function() {
	$.mobile.loading("hide");
});

//$(document).delegate('#cut', 'pageshow', function() {
//alert("Page show");
//    $.mobile.loading("hide");
//});

$(document).delegate('#loginform', 'pageshow', function() {
	var remember = localStorage.getItem('remember');
	if (remember == 'true') {
		// autofill the Usernam/Passwrod if the Remember Me is true
		$('#username').attr("value", localStorage.getItem('username'));
		$('#password').attr("value", localStorage.getItem('password'));
		$('#remember').attr('checked', true).checkboxradio("refresh");
	}

});

$(document).bind('keydown', function(event) {
	if (event.keyCode == 27) {// 27 = 'Escape' keyCode (back button)
		//alert("Back Button");
		event.preventDefault();
	}
});

$(document).on("click", ".show-page-loading-msg", function() {
	var $this = $(this), theme = $this.jqmData("theme") || $.mobile.loader.prototype.options.theme, msgText = $this.jqmData("msgtext") || $.mobile.loader.prototype.options.text, textVisible = $this.jqmData("textvisible") || $.mobile.loader.prototype.options.textVisible, textonly = !!$this.jqmData("textonly");
	html = $this.jqmData("html") || "";
	$.mobile.loading("show", {
		text : msgText,
		textVisible : textVisible,
		theme : theme,
		textonly : textonly,
		html : html
	});
});

$(document).ready(function() {

	//check_network();

	$(function() {
		setTimeout(hideSplash, 1000);
	});

	function hideSplash() {
		$.mobile.changePage("#loginform", "fade");
	}

	//Login
	$('#login').click(function() {
		$.mobile.loading("show");
		var uname = $("#username").val();
		var pwd = $("#password").val();
		var syncd = localStorage.getItem('remember');
		Validate_Login(uname, pwd);
		if (session == "S") {
			remember_me();

			if (localStorage.getItem('sync') == "Y") {
				load_orders_from_local_storage();
			} else {
				check_network();
				if (isOnline == "Y") {
					load_orders();
				} else {
					alert("Please connect to network and Sync data");
				}
			}
			//$.mobile.changePage("#orders", "fade");
			$.mobile.changePage("#menu", "fade");
		} else {
			//$.mobile.changePage("#loginfail", "fade");
			$.mobile.changePage("#menu", "fade");
		}

	});

	$('#cut_back').click(function() {
		load_orders();
	});

	$('#logout').click(function() {
		session = "F";
	});

	$('#delete_data').click(function() {
		//localStorage.clear();
		var lsLength = localStorage.length;
		var keyVal;
		for (var i = 0; i < lsLength; i++) {
			keyVal = localStorage.key(i);
			alert(keyVal);
			if ((keyVal.indexOf("order") !== -1) || (keyVal.indexOf("sync") !== -1)) {
				localStorage.removeItem(keyVal);
			}
		}
		alert("Data deleted successfully");
	});

	$('#latlang').click(function() {
		var Geo = {};

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(success, error);
		}
		function success(position) {
			Geo.lat = position.coords.latitude;
			Geo.lng = position.coords.longitude;

			$('#x').val(Geo.lat);
			$('#y').val(Geo.lng);
		}

		function error() {
			alert("Unable to get the location details");
			//console.log("Geocoder failed");
		}

	});

	$('#orders').delegate('li', 'click', function() {
		var myOrdnum = $(this).text();
		myOrdnum = myOrdnum.replace(/\s+/g, '');

		var myURL = "http://anica.azurewebsites.net/WODetail.asp?ORDID=" + myOrdnum + "&ProcID=EMBM_EXD";
		// console.log(myURL);

		$.ajax({
			type : 'GET',
			url : myURL,
			dataType : "xml",
			success : function(data) {
				//console.log("Details XML fetch successfull");
				var myXML1 = $(data);

				var Order = $(myXML1).find("AUFNR").text();
				var Oper = $(myXML1).find("OPERATION").text();
				var TBros = $(myXML1).find("TBROS").text();
				var Permit_No = $(myXML1).find("PERMIT_NO").text();
				var City = $(myXML1).find("CITY").text();
				var Perm_Expdt = $(myXML1).find("PERM_EXPDT").text();

				localStorage.removeItem('Order');
				localStorage.removeItem('Oper');
				localStorage.setItem('Order', Order);
				localStorage.setItem('Oper', Oper);

				//  console.log("Order #: " + Order + "TBROS:" + TBros + "Permit #:" + Permit_No);
				$("#cut").page();
				$('#ord_header div').remove();

				$("#ord_header").append('<div align="center"><p><strong>Order #: ' + $(myXML1).find("AUFNR").text() + '</strong></p><p>Thomas Bros: ' + $(myXML1).find("TBROS").text() + '</p><p>Permit #: ' + $(myXML1).find("PERMIT_NO").text() + '</p></div>');
				refresh_cut_page();
				$.mobile.changePage("#cut", "fade");

			},
			error : function(a, b, c) {
				alert("Unable to process the request, please try again later.");
				//console.log("Unable to fetch Details XML");
			}
		});
	});

	$('#sync,#syncu,#syncd').click(function() {
		//var option = $(this).text();
		//option = option.replace(/\s+/g, '');
		//alert(option);
		//if(option == "SyncDown")
		//{
		check_network();
		if (isOnline == "Y") {
			localStorage.setItem('sync', "Y");
			load_order_list_to_local_storage();
		} else {
			alert("Unable to Sync. Make sure you are connected to internet and try again");
		}

		//}

	});

	//Submit function in the Cut Details page
	$('#submit').click(function() {
		if ($('#arrowbn').is(":checked")) {
			var arrowbn = "1";
		} else {
			var arrowbn = "0";
		}

		if ($('#jtmeetreq').is(":checked")) {
			var jtmeetreq = "1";
		} else {
			var jtmeetreq = "0";
		}

		if ($('#retwall').is(":checked")) {
			var retwall = "1";
		} else {
			var retwall = "0";
		}

		if ($('#tsrep').is(":checked")) {
			var tsrep = "1";
		} else {
			var tsrep = "0";
		}

		if ($('#resreq').is(":checked")) {
			var resreq = "1";
		} else {
			var resreq = "0";
		}

		var lane = $('#lane').val();
		var splfin = $('#splfin').val();
		var sweepday = $('#sweepday').val();
		var ftime = $('#ftime').val();
		var ttime = $('#ttime').val();
		var contname = $('#contname').val();
		var custphone = $('#custphone').val();
		var x = $('#x').val();
		var y = $('#y').val();
		var remarks = $('#remarks').val();

		var myOrdnum = localStorage.getItem('Order');
		var myURL = "http://anica.azurewebsites.net/WODetail.asp?ORDID=" + myOrdnum + "&ProcID=EMBM_EXD";

		$.ajax({
			type : 'GET',
			url : myURL,
			dataType : "xml",
			success : function(xml) {
				var myXML2 = parseXML(xml);

				$(myXML2).find("ARROW_BOARD").text(arrowbn);
				$(myXML2).find("RESTRIPE").text(resreq);
				$(myXML2).find("RETAIN_WALL").text(retwall);
				$(myXML2).find("TOP_SECTION_LID_REPL").text(tsrep);
				$(myXML2).find("JT_MEET_REQ").text(jtmeetreq);

				$(myXML2).find("MAJOR_ST_LANE").text(lane);
				$(myXML2).find("SPEC_FINISH").text(splfin);
				$(myXML2).find("STREET_SWEEP_DAY").text(sweepday);
				$(myXML2).find("STREET_SWEEP_START").text(ftime);
				$(myXML2).find("STREET_SWEEP_END").text(ttime);
				$(myXML2).find("CUSTNAME").text(contname);
				$(myXML2).find("CUSTTEL").text(custphone);
				$(myXML2).find("REMARKS").text(remarks);

				var xmlString = (new XMLSerializer()).serializeToString(myXML2);
				var url_RoleID = "WM";
				var url_ProcID = "EMBM_EXD";
				var url_DocID = localStorage.getItem('Order');
				var url_UserID = "Anica";
				var url_ItemID = localStorage.getItem('Oper');
				var url_Status = "C";

				var PURL = "http://anica.azurewebsites.net/update.asp?" + "RoleID=" + encodeURIComponent(url_RoleID) + "&ProcID=" + encodeURIComponent(url_ProcID) + "&DocID=" + encodeURIComponent(url_DocID) + "&UserID=" + encodeURIComponent(url_UserID) + "&ItemID=" + encodeURIComponent(url_ItemID) + "&Status=" + encodeURIComponent(url_Status);

				//console.log(PURL);

				$.ajax({
					url : PURL,
					data : xmlString,
					processData : false,
					contentType : false,
					type : 'POST',
					success : function(status) {
						// console.log(status);
						if (status.indexOf("1") !== -1) {
							localStorage.removeItem('Order');
							localStorage.removeItem('Oper');
							//console.log("XML Updated successfully");
							window.location.href = '#orders';
						} else {
							alert("Unable to process the request, please try again later.");
							//console.log("Update Failed")
						}
					},
					error : function(a, b, c) {
						alert("Unable to process the request, please try again later.");
						//console.log("XML Update Failed");
					}
				});
			},
			error : function(a, b, c) {
				alert("Unable to process the request, please try again later.");
				//console.log("Unable to fetch Details XML");
			}
		});

	});
	function parseXML(xml) {
		return xml;
	}

	function Validate_Login(uname, pwd) {
		LUserId = encodeURIComponent(uname);
		LPassWord = encodeURIComponent(pwd);

		var parameters = "EMAIL=" + LUserId + "&PWD=" + LPassWord;
		//console.log(parameters);

		$.ajax({
			type : "POST",
			url : "http://anica.azurewebsites.net/auth/Logon.asp",
			async : false,
			data : parameters,
			success : function(status) {
				if (status.indexOf("1") !== -1) {
					session = 'S';
					//console.log("Login Successful");
				}
			},
			error : function(a, b, c) {
				if (uname == localStorage.getItem('username') && pwd == localStorage.getItem('password')) {
					session = 'S';
				}
				//console.log("Login check failed");
			}
		});
	}

	function remember_me() {
		var uname = $("#username").val();
		var pwd = $("#password").val();
		if ($('#remember').is(":checked")) {
			localStorage.setItem('username', uname);
			localStorage.setItem('password', pwd);
			localStorage.setItem('remember', 'true');
		} else {
			localStorage.clear();
			//localStorage.removeItem('username');
			//localStorage.removeItem('password');
			//localStorage.removeItem('remember');
		}
	}

	function refresh_cut_page() {
		$('#sweepday').val('Monday').selectmenu('refresh');
		$('#splfin').val('Pavers').selectmenu('refresh');
		$('#ftime').val('');
		$('#ttime').val('');
		$('#contname').val('');
		$('#custphone').val('');
		$('#x').val('');
		$('#y').val('');
		$('#remarks').val('');
		$('#lane').val('');
		$("input[type='checkbox']").attr("checked", false).checkboxradio("refresh");
	}

	function load_orders() {
		$.ajax({
			type : 'GET',
			url : 'http://anica.azurewebsites.net/WOList.asp?UID=&PWD=&LogIn=Log+In',
			dataType : "xml",
			success : function(data) {
				var myXML = $(data);

				$('#orders #order_list').empty();

				//Build Orders
				$(myXML).find("Order").each(function() {
					var ProcID = $(this).attr("ProcID");
					var Status = $(this).attr("Status");
					//  console.log("ProcID: " + ProcID + "Status: " + Status);

					if ((ProcID == "EMBO_EXD") && (Status == "N" || Status == "P"))
					// if(ProcID == "EMBO_EXD")
					{
						$("#orders #order_list").append('<li class="show-page-loading-msg" data-textonly="false" data-textvisible="true" data-msgtext="Please Wait"><a href="">' + $(this).text() + '</a></li>');
					}
				});
				$('#order_list').listview('refresh');
			},
			error : function(a, b, c) {
				alert('Unable to process your request. Please try again later');
				//console.log('Unable to fetch Orders XML');
			}
		});
	}

	function load_order_list_to_local_storage() {
		$.ajax({
			type : 'GET',
			url : 'http://anica.azurewebsites.net/WOList.asp?UID=&PWD=&LogIn=Log+In',
			dataType : "xml",
			success : function(data) {
				var orderListStr = (new XMLSerializer()).serializeToString(data);
				localStorage.setItem('orderList', orderListStr);
				load_order_data_to_local_storage();
				alert("Sync Successfull");
			},
			error : function(a, b, c) {
				alert('Unable to process your request. Make sure you are connected to internet and try again');
				//console.log('Unable to fetch Orders XML');
			}
		});
	}

	function load_order_data_to_local_storage() {
		var ordersListXML = $(localStorage.getItem('orderList'));

		$(ordersListXML).find("Order").each(function() {
			var ProcID = $(this).attr("ProcID");
			var Status = $(this).attr("Status");

			if ((ProcID == "EMBO_EXD") && (Status == "N" || Status == "P")) {

				var orderNo = $(this).text();
				orderNo = orderNo.replace(/\s+/g, '');

				var orderDetURL = "http://anica.azurewebsites.net/WODetail.asp?ORDID=" + orderNo + "&ProcID=EMBM_EXD";
				//console.log(orderDetURL);

				$.ajax({
					type : 'GET',
					url : orderDetURL,
					dataType : "xml",
					success : function(data) {
						var orderDetStr = (new XMLSerializer()).serializeToString(data);
						var orderStatus = "N";
						var orderDetArr = new Array();

						orderDetArr.push(today);
						orderDetArr.push(orderDetStr);
						orderDetArr.push(orderStatus);

						try {
							localStorage.setItem('order_data_' + orderNo, orderDetArr.join(";"));
						} catch (e) {
							if (e == QUOTA_EXCEEDED_ERR) {
								console.log("Quota exceeded! for Local Storage");
							}
						}
					},
					error : function(a, b, c) {
						//alert("Unable to process the request, please try again later.");
						console.log("Unable to fetch Details XML in Local Storage for Order:" + orderNo);
					}
				});
			}
		});

	}

	function load_orders_from_local_storage() {
		var ordersListXML = $(localStorage.getItem('orderList'));
		$('#orders #order_list').empty();
		$(ordersListXML).find("Order").each(function() {
			var ProcID = $(this).attr("ProcID");
			var Status = $(this).attr("Status");

			if ((ProcID == "EMBO_EXD") && (Status == "N" || Status == "P")) {
				$("#orders #order_list").append('<li class="show-page-loading-msg" data-textonly="false" data-textvisible="true" data-msgtext="Please Wait"><a href="">' + $(this).text() + '</a></li>');
			}
		});
	}

	function check_network() {
		$.ajax({
			type : 'GET',
			url : 'http://www.google.com',
			async : false,
			success : function(data) {
				isOnline = "Y";
			},
			error : function(a, b, c) {
				isOnline = "N";
			}
		});

	}

});

