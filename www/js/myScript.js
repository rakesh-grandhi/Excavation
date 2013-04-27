/**
 * @author Rakesh
 */

//Global Variables
var gv_username, gv_password;
var session = null;
var isOnline = null;
var statusMsg = null;

var newDate = new Date();
var dd = newDate.getDate();
var mm = newDate.getMonth() + 1;
var yyyy = newDate.getFullYear();
var today = mm + '/' + dd + '/' + yyyy;
//End

$(document).delegate('#cut', 'pagebeforeshow', function() {
	$('#details_list').listview('refresh');
});

$(document).delegate('#menu', 'pagebeforeshow', function() {
	$('#menu_list').listview('refresh');
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
	} else {
		$('#username').attr("value", '');
		$('#password').attr("value", '');
		$('#remember').attr('checked', false).checkboxradio("refresh");
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
			/*
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
			 */
			order_count_to_sync_up();
			//$.mobile.changePage("#orders", "fade");
			$.mobile.changePage("#menu", "flow");
		} else {
			localStorage.removeItem('remember');
			$('#username').attr("value", '');
			$('#password').attr("value", '');
			$('#remember').attr('checked', false).checkboxradio("refresh");
			$.mobile.changePage("#loginfail", "fade");
		}

	});

	$('#cut_back').click(function() {
		load_orders();
	});

	$('#orders_back').click(function() {
		order_count_to_sync_up();
	});

	$('#menu_orders').click(function() {
		load_orders();
		$.mobile.changePage("#orders", "fade");
		/*
		 var ord_cnt;

		 ord_cnt = load_orders();
		 alert(ord_cnt);
		 if (ord_cnt > 0) {
		 $.mobile.changePage("#orders", "fade");
		 } else {
		 //check_network();
		 if (isOnline == "Y") {
		 alert("There are no orders assigned to you");
		 } else {
		 alert("Please connect to network and sync");
		 }
		 }
		 */
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
			//alert(keyVal);
			if (keyVal !== null) {
				if ((keyVal.indexOf("order") !== -1) || (keyVal.indexOf("sync") !== -1)) {
					//alert(keyVal);
					localStorage.removeItem(keyVal);
				}
			}
		}
		load_orders();
		order_count_to_sync_up();
		$('#menu_list').listview('refresh');
		statusMsg = "Data deleted successfully";
		toast(statusMsg);
		//alert("Data deleted successfully");
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
			//alert("Unable to get the location details");
			statusMsg = "Unable to get the location details";
			toast(statusMsg);
			//console.log("Geocoder failed");
		}

	});

	$('#map').click(function() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(success, error);
		}
		function success(position) {
			//Geo.lat = position.coords.latitude;
			//Geo.lng = position.coords.longitude;
			initialize(position.coords.latitude, position.coords.longitude);
		}

		function error() {
			//alert("Unable to get the location details");
			statusMsg = "Unable to get the location details";
			toast(statusMsg);
			//console.log("Geocoder failed");
		}

		//if (navigator.geolocation) {
		//	navigator.geolocation.getCurrentPosition(success, (position) {
		//		initialize(position.coords.latitude, position.coords.longitude);
		//	});
		//}
	});

	function initialize(lat, lng) {
		var latlng = new google.maps.LatLng(lat, lng);
		var myOptions = {
			zoom : 15,
			center : latlng,
			mapTypeId : google.maps.MapTypeId.ROADMAP
		};
		var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
		$.mobile.changePage("#page_map", "fade");
	}


	$('#orders').delegate('li', 'click', function() {
		var orderNo = $(this).text();
		orderNo = orderNo.replace(/\s+/g, '');

		if (localStorage.getItem('sync') == "Y" && localStorage.getItem('order_data_' + orderNo) != null) {
			load_order_data_from_local_storage(orderNo);
		} else {
			var myURL = "http://anica.azurewebsites.net/WODetail.asp?ORDID=" + orderNo + "&ProcID=EMBM_EXD";
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
					//alert("Unable to process the request, please try again later.");
					statusMsg = "Unable to process the request, please try again later.";
					toast(statusMsg);
					//console.log("Unable to fetch Details XML");
				}
			});

		}

	});

	$('#sync,#syncd').click(function() {
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
			statusMsg = "Unable to Sync. Make sure you are connected to internet and try again";
			//display_toast(statusMsg);
			toast(statusMsg);
			//alert("Unable to Sync. Make sure you are connected to internet and try again");
		}
		//}
	});

	$('#syncu').click(function() {
		check_network();
		if (isOnline == "Y") {
			upload_data_from_local_storage();
			order_count_to_sync_up();
			$('#menu_list').listview('refresh');
		} else {
			statusMsg = "Unable to Sync. Make sure you are connected to internet and try again";
			toast(statusMsg);
			//alert("Unable to Sync. Make sure you are connected to internet and try again");
		}
	});

	//Submit function in the Cut Details page
	$('#submit').click(function() {

		var arrowbn, jtmeetreq, retwall, tsrep, tsrep_val, resreq, lane, splfin_type, splfin, myOrdnum, sweepday, ftime, ttime, contname, custphone, x, y, remarks;

		if ($('#arrowbn').is(":checked")) {
			arrowbn = "1";
		} else {
			arrowbn = "0";
		}

		if ($('#jtmeetreq').is(":checked")) {
			jtmeetreq = "Y";
		} else {
			jtmeetreq = "N";
		}

		if ($('#retwall').is(":checked")) {
			retwall = "Y";
		} else {
			retwall = "N";
		}

		if ($('#tsrep').is(":checked")) {
			tsrep = "1";
			if ($('#tslid').val() != "default") {
				tsrep_val = $('#tslid').val();
			}
		} else {
			tsrep = "0";
		}

		if ($('#resreq').is(":checked")) {
			resreq = "Y";
		} else {
			resreq = "N";
		}

		lane = $('#lane').val();

		if ($('#splfin').val() != "default") {
			splfin_type = $('#splfin').val();
			splfin = "Y";
		} else {
			splfin = "N";
		}

		if ($('#sweepday').val() != "default") {
			sweepday = $('#sweepday').val();
		}

		ftime = $('#ftime').val();
		ttime = $('#ttime').val();
		contname = $('#contname').val();
		custphone = $('#custphone').val();

		x = $('#x').val();
		y = $('#y').val();
		remarks = $('#remarks').val();

		myOrdnum = localStorage.getItem('Order');

		check_network();

		if (isOnline == "Y") {
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
					$(myXML2).find("TOP_SECTION_LID_REPL").text(tsrep_val);
					$(myXML2).find("JT_MEET_REQ").text(jtmeetreq);

					$(myXML2).find("MAJOR_ST_LANE").text(lane);
					$(myXML2).find("SPEC_FINISH").text(splfin);
					$(myXML2).find("SPEC_FINISH_TYPE").text(splfin_type);
					$(myXML2).find("STREET_SWEEP_DAY").text(sweepday);
					$(myXML2).find("STREET_SWEEP_START").text(ftime);
					$(myXML2).find("STREET_SWEEP_END").text(ttime);
					$(myXML2).find("CUSTNAME").text(contname);
					$(myXML2).find("CUSTTEL").text(custphone);
					$(myXML2).find("REMARKS").text(remarks);
					$(myXML2).find("X_COORDINATE").text(x);
					$(myXML2).find("Y_COORDINATE").text(y);

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
								//alert("Unable to process the request, please try again later.");
								statusMsg = "Unable to process the request, please try again later.";
								toast(statusMsg);
								//console.log("Update Failed")
							}
						},
						error : function(a, b, c) {
							//alert("Unable to process the request, please try again later.");
							statusMsg = "Unable to process the request, please try again later.";
							toast(statusMsg);
							//console.log("XML Update Failed");
						}
					});
				},
				error : function(a, b, c) {
					//alert("Unable to process the request, please try again later.");
					statusMsg = "Unable to process the request, please try again later.";
					toast(statusMsg);
					//console.log("Unable to fetch Details XML");
				}
			});
		} else {

			var orderDataArray = localStorage.getItem('order_data_' + myOrdnum);
			orderDataArray = orderDataArray.split(";");
			var orderDataXML = orderDataArray[3];
			var myXML = textToXML(orderDataXML);

			$(myXML).find("ARROW_BOARD").text(arrowbn);
			$(myXML).find("RESTRIPE").text(resreq);
			$(myXML).find("RETAIN_WALL").text(retwall);
			$(myXML).find("TOP_SECTION_LID_REPL").text(tsrep_val);
			$(myXML).find("JT_MEET_REQ").text(jtmeetreq);

			$(myXML).find("MAJOR_ST_LANE").text(lane);
			$(myXML).find("SPEC_FINISH").text(splfin);
			$(myXML).find("SPEC_FINISH_TYPE").text(splfin_type);
			$(myXML).find("STREET_SWEEP_DAY").text(sweepday);
			$(myXML).find("STREET_SWEEP_START").text(ftime);
			$(myXML).find("STREET_SWEEP_END").text(ttime);
			$(myXML).find("CUSTNAME").text(contname);
			$(myXML).find("CUSTTEL").text(custphone);
			$(myXML).find("REMARKS").text(remarks);
			$(myXML).find("X_COORDINATE").text(x);
			$(myXML).find("Y_COORDINATE").text(y);

			var xmlString = (new XMLSerializer()).serializeToString(myXML);

			var orderStatus = "C";
			var orderDetArr = new Array();
			//Last updated
			orderDetArr.push(today);
			//Order #
			orderDetArr.push(myOrdnum);
			//Oper #
			orderDetArr.push(localStorage.getItem('Oper'));
			//Order Data String
			orderDetArr.push(xmlString);
			//Status(N-New,C-Completed)
			orderDetArr.push(orderStatus);

			localStorage.setItem('order_data_' + myOrdnum, orderDetArr.join(";"));
			localStorage.removeItem('Order');
			localStorage.removeItem('Oper');
			//console.log("XML Updated successfully");
			load_orders();
			window.location.href = '#orders';
		}

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
				} else {
					session = 'F';
				}
			},
			error : function(a, b, c) {
				//alert(localStorage.getItem('username'));
				//alert(localStorage.getItem('password'));
				if ((uname == localStorage.getItem('username')) && (pwd == localStorage.getItem('password'))) {
					session = 'S';
				} else {
					session = 'F';
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
		$('#tslid').val('').selectmenu('refresh');
		$('#sweepday').val('').selectmenu('refresh');
		$('#splfin').val('').selectmenu('refresh');
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
		var order_cnt = 0;
		check_network();
		if (isOnline == "Y") {
			//alert("Online");
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
							order_cnt = order_cnt + 1;
						}
					});
					//$('#order_list').listview('refresh');
				},
				error : function(a, b, c) {
					//alert('Unable to process your request. Please try again later');
					statusMsg = "Unable to process the request, please try again later.";
					toast(statusMsg);
					//console.log('Unable to fetch Orders XML');
				}
			});

		} else {
			var keyVal, lsLength, orderDataArray;
			lsLength = localStorage.length;
			$('#orders #order_list').empty();
			for (var i = 0; i < lsLength; i++) {
				keyVal = localStorage.key(i);
				//alert(keyVal);
				if (keyVal.indexOf("order_data") !== -1) {
					orderDataArray = localStorage.getItem(keyVal);
					orderDataArray = orderDataArray.split(";");
					if (orderDataArray[4] == "N") {
						order_cnt = order_cnt + 1;
						$("#orders #order_list").append('<li class="show-page-loading-msg" data-textonly="false" data-textvisible="true" data-msgtext="Please Wait"><a href="">' + orderDataArray[1] + '</a></li>');
					}
				}
			}
			//$('#order_list').listview('refresh');
		}
		return order_cnt;
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
				statusMsg = "Sync Successfull";
				//display_toast(statusMsg);
				toast(statusMsg);
				//alert("Sync Successfull");
			},
			error : function(a, b, c) {
				//alert('Unable to process your request. Make sure you are connected to internet and try again');
				statusMsg = "Unable to process your request. Make sure you are connected to internet and try again";
				toast(statusMsg);
				//console.log('Unable to fetch Orders XML');
			}
		});
	}

	function load_order_data_to_local_storage() {
		var ordersListXML = $(localStorage.getItem('orderList'));

		$(ordersListXML).find("Order").each(function() {
			var ProcID = $(this).attr("ProcID");
			var Status = $(this).attr("Status");
			var Oper = $(this).attr("ItemID");

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
						//Last updated
						orderDetArr.push(today);
						//Order #
						orderDetArr.push(orderNo);
						//Oper #
						orderDetArr.push(Oper);
						//Order Data String
						orderDetArr.push(orderDetStr);
						//Status(N-New,C-Completed)
						orderDetArr.push(orderStatus);

						try {
							localStorage.setItem('order_data_' + orderNo, orderDetArr.join(";"));
							//localStorage.setItem('order_data_' + orderNo, orderDetStr);
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

	function load_order_data_from_local_storage(orderNo) {
		var orderDataArray = localStorage.getItem('order_data_' + orderNo);
		orderDataArray = orderDataArray.split(";");
		var orderDataXML = $(orderDataArray[3]);

		var Order = $(orderDataXML).find("AUFNR").text();
		var Oper = $(orderDataXML).find("OPERATION").text();
		var TBros = $(orderDataXML).find("TBROS").text();
		var Permit_No = $(orderDataXML).find("PERMIT_NO").text();
		var City = $(orderDataXML).find("CITY").text();
		var Perm_Expdt = $(orderDataXML).find("PERM_EXPDT").text();

		localStorage.removeItem('Order');
		localStorage.removeItem('Oper');
		localStorage.setItem('Order', Order);
		localStorage.setItem('Oper', Oper);

		//  console.log("Order #: " + Order + "TBROS:" + TBros + "Permit #:" + Permit_No);
		$("#cut").page();
		$('#ord_header div').remove();

		$("#ord_header").append('<div align="center"><p><strong>Order #: ' + $(orderDataXML).find("AUFNR").text() + '</strong></p><p>Thomas Bros: ' + $(orderDataXML).find("TBROS").text() + '</p><p>Permit #: ' + $(orderDataXML).find("PERMIT_NO").text() + '</p></div>');
		refresh_cut_page();
		$.mobile.changePage("#cut", "fade");
	}

	function upload_data_from_local_storage() {
		var lsLength = localStorage.length;
		var keyVal, not_synced = 0;
		for (var i = 0; i < lsLength; i++) {
			keyVal = localStorage.key(i);

			if (keyVal.indexOf("order_data") !== -1) {
				var orderDataArray = localStorage.getItem(keyVal);
				orderDataArray = orderDataArray.split(";");
				if (orderDataArray[4] == "C") {
					var orderDataString = orderDataArray[3];
					var url_RoleID = "WM";
					var url_ProcID = "EMBM_EXD";
					var url_DocID = orderDataArray[1];
					var url_UserID = "Anica";
					var url_ItemID = orderDataArray[2];
					var url_Status = "C";

					var PURL = "http://anica.azurewebsites.net/update.asp?" + "RoleID=" + encodeURIComponent(url_RoleID) + "&ProcID=" + encodeURIComponent(url_ProcID) + "&DocID=" + encodeURIComponent(url_DocID) + "&UserID=" + encodeURIComponent(url_UserID) + "&ItemID=" + encodeURIComponent(url_ItemID) + "&Status=" + encodeURIComponent(url_Status);

					$.ajax({
						url : PURL,
						data : orderDataString,
						processData : false,
						contentType : false,
						type : 'POST',
						success : function(status) {
							// console.log(status);
							if (status.indexOf("1") !== -1) {

								//console.log("XML Updated successfully");
							} else {
								not_synced = not_synced + 1;
								//alert("Unable to process the request, please try again later.");
								console.log("Update XML failed for Order #:" + orderDataArray[1])
							}
						},
						error : function(a, b, c) {
							//alert("Unable to process the request, make sure you are connected to internet");
							console.log("No network connection");
						}
					});
				}
			}
		}
		if (not_synced >= 1) {
			statusMsg = "Unable to sync. Make sure you are connected to network";
			toast(statusMsg);
			//alert("Unable to Sync");
		} else {
			localStorage.clear();
			//alert("Sync successfull");
			statusMsg = "Sync successfull";
			toast(statusMsg);
		}

	}

	function order_count_to_sync_up() {
		var keyVal, lsLength, orderDataArray, order_cnt = 0;
		lsLength = localStorage.length;
		for (var i = 0; i < lsLength; i++) {
			keyVal = localStorage.key(i);
			//alert(keyVal);
			if (keyVal.indexOf("order_data") !== -1) {
				orderDataArray = localStorage.getItem(keyVal);
				orderDataArray = orderDataArray.split(";");
				if (orderDataArray[4] == "C") {
					order_cnt = order_cnt + 1;
				}
			}
		}
		$("#syncu").append('<span class="ui-li-count">' + order_cnt + '</span>');
	}

	function check_network() {
		$.ajax({
			type : 'GET',
			url : 'http://anica.azurewebsites.net/WOList.asp?UID=&PWD=&LogIn=Log+In',
			async : false,
			success : function(data) {
				isOnline = "Y";
			},
			error : function(a, b, c) {
				isOnline = "N";
			}
		});
	}

	function textToXML(str) {
		try {
			var xml = null;
			if (window.DOMParser) {
				var parser = new DOMParser();
				xml = parser.parseFromString(str, "text/xml");
				var found = xml.getElementsByTagName("parsererror");
				if (!found || !found.length || !found[0].childNodes.length) {
					return xml;
				}
				return null;
			} else {
				xml = new ActiveXObject("Microsoft.XMLDOM");
				xml.async = false;
				xml.loadXML(str);
				return xml;
			}
		} catch ( e ) {
			// suppress
		}
	}

	function display_toast(msg) {
		$("<div class='ui-loader ui-overlay-shadow ui-body-a ui-corner-all'><p>" + msg + "</p></div>").css({
			"display" : "block",
			"opacity" : 0.96,
			"top" : $(window).scrollTop() + 300
			//"vertical-align" : "middle"
		}).appendTo($.mobile.pageContainer).delay(1500).fadeOut(400, function() {
			$(this).remove();
		});
	}

	function toast(sMessage) {
		var container = $(document.createElement("div"));
		container.addClass("toast");

		var message = $(document.createElement("div"));
		message.addClass("message");
		message.text(sMessage);
		message.appendTo(container);

		container.appendTo(document.body);

		container.delay(100).fadeIn("slow", function() {
			$(this).delay(2000).fadeOut("slow", function() {
				$(this).remove();
			});
		});
	}

});

