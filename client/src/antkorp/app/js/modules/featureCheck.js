/****************************************************************
 * Copyright (c) Neptunium Pvt Ltd., 2014.
 * Author: Neptunium Pvt Ltd..
 *
 * This unpublished material is proprietary to Neptunium Pvt Ltd..
 * All rights reserved. The methods and techniques described herein 
 * are considered trade secrets and/or confidential. Reproduction or 
 * distribution, in whole or in part, is forbidden except by express 
 * written permission of Neptunium.
 ****************************************************************/


/**
 * @fileOverview Helps to check the required features are available in the browser, if not throws error .
 * @name feature check 
 */

define(
		"featureCheck",
		[ "jquery", "underscore", "backbone", "modernizr","akputils" ],
		function($, _, Backbone, modernizr , utils) {

			var Controller = Backbone.View
					.extend({
						initialize : function() {
							$('<div/>').addClass("overlay").attr("id","logOverlay").appendTo('body');
							$(".akorp-ui").hide();
							this.mask = $("#logOverlay");
							window.MediaSource = window.MediaSource|| window.WebKitMediaSource;
							this.appload = $('#loadbar');
							this.loading=false;
						},
						baseCss : {
							"font-size" : "24px",
							"color" : "red",
							"margin" : "20px",
							"line-height" : "30px",
						},
						check : function() {
							/*
							 * Check1: checking browser
							 */
							
							
							  
							
							 
							var isChrome = /chrom(e|ium)/
									.test(navigator.userAgent.toLowerCase());
							if (!isChrome) {
								this.venderError();
								return false;

							}
							
							
							

							/*
							 * Check2: Checking for websocket support.
							 */

							if (!Modernizr.websockets) {
								this.noSupport();
								return false;
							}

							return true;
						},
						statusMsgs : {
							"wait" : "<p>Please wait, we are getting your identity..</p>",
							"unreachable" : "<p>Sorry! antkorp is unreachable at the moment,<br> please try after some time.</p>",
							"noSupport" : "<p>Oops! your browser doesn't compatible with the application, <br>please upgrade your browser to try our demo.</p>",
							"venderError" : "<p>Sorry! We only support Google Chrome.<br> Get Chrome and try our Demo.</p>",
							"noResponse" : "<p>Sorry! antkorp is not responding at the moment,<br> please try after some time.</p>",
						},
						show : function(text) {
							$(".errDailog").remove();
							var msg = $("<div/>").attr("id", "browserFailMsg").addClass("modal errDailog").appendTo("body").append(text);
							this.mask.show();
							this.adjust("#" + msg.attr("id"));
						},
						unautherized : function() {

						},
						verifying : function() {

							var msg = $(this.statusMsgs["wait"]).css(this.baseCss);
							
							this.show(msg)

						},
						
						notReachable : function() {
							if(this.loading) this.loaded();
							var msg = $(this.statusMsgs["unreachable"]).css(this.baseCss);

							this.show(msg);

						},
						noSupport : function() {
							if(this.loading) this.loaded();
							
							var icon=$("<span class='icon-html5 akorp-error-icon' style=' '>");
							var msg = $(this.statusMsgs["noSupport"]).addClass("akorp-error-msg");
							var msgbox = $("<div/>").append(icon).append(msg);
							
							this.show(msgbox);

						},
						notResponding : function() {
							var msg = $(this.statusMsgs["noResponse"]).css(this.baseCss);
							this.show(msg);
						},
						venderError : function() {
							if(this.loading) this.loaded();
							
							var icon=$("<span class='akorp-error-icon' ><img src='https://ssl.gstatic.com/images/icons/product/chrome-64.png' alt='Chrome' /></span>");
							
							var msg = $(this.statusMsgs["venderError"])	.addClass("akorp-error-msg");
							
							var msgbox = $("<div/>").append(icon).append(msg);
							
							this.show(msgbox);

						},
						success : function() {

						},
						adjust : function(id) {
							$(id).css("max-width", "80%");

							var w = $(id).width();
							var h = $(id).height();

							var nw = -w / 2;
							var nh = -h / 2;

							$(id).css({
								"top" : "20%",
								"left" : "50%",
								"margin-left" : nw + "px",
							// "margin-top" : nh + "px"
							});
						},
						showLoader : function() {
							this.appload.show();

							utils.makeCenter("#loadbar");
							this.loading=true;
						},
						loader : function() {

							window.loadComplete = 0;
							var _self = this;
							if(!this.loading)this.showLoader();
							
							window.loader = function(percentage, apploadstatus) {
								loadComplete += percentage;

								/*
								 * appload.children(".apploadbar").children(".loadpercentage")
								 * .css({ //"width" : loadComplete + "%" })
								 */

								_self.appload.children(".apploadstatus").html(apploadstatus);
								
								//this.logger(loadComplete + " " + apploadstatus);
								if (loadComplete == 100) {

									//_self.appload.hide();
									_self.changeLoadStatus("Connecting to the server...")

								}

							}
						},
						changeLoadStatus:function(status){
							this.appload.children(".apploadstatus").html(status)
						},
						loaded:function(){
							this.appload.hide();
							this.loading=false;
						},
						logger : function() {

							window.logger = function(msg) {
								this.canLog = false;
								if (canLog) {
									console.log(msg);
								}
							}

						},
						checkURL : function() {
							return utils.str2Data(window.location.search);
						}

					});
			return Controller;
		});