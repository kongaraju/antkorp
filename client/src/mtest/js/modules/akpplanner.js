/**
 * @author Raju K
 */
define(
		"akpplanner",
		[ "jquery", "underscore", "backbone", "akpauth", "akpcontacts",
				"akputils",	"plugins/jquery-ui", "plugins/gettheme", "plugins/jqxcore","plugins/jqxwindow",
				"plugins/jquery-tmpl", "plugins/fullcalendar.min" ],
		function($, _, Backbone, auth, contacts, utils) {
			loader(10, "planner Loaded");

			var baseModel = Backbone.Model.extend({
				defaults : {
					service : "calendar",
				}
			});
			var eventModel = Backbone.Model.extend({
				defaults : {
					title : "",
					description : "",
					start : null,
					type : "",
				}
			});
			var eventsStore = Backbone.Collection.extend({
				model : eventModel,

			});

			var EventsDB = new eventsStore;

			/*
			 * Controller
			 */

			var baseCollection = Backbone.Collection
					.extend({
						model : baseModel,
						today : new Date(),
						initialize : function() {
							_.bindAll(this, "onVisible");
							this._map = {};
							this._objCln = {};
						},
						onVisible : function() {
							this.trigger("visible");
						},
						date2String : function(date, str) {
							// console.log(date);
							return $.fullCalendar.formatDate(date, str);
						},
						start : function() {
							this.trigger("init");

						},
						send : function(recvd) {
							// console.log(recvd);
							if (recvd.mesgtype == "response") {
								if (this._map[recvd.cookie] == "delete") {
									this.trigger("eventremove",
											this._objCln[recvd.cookie].id);
								} else if (this._map[recvd.cookie] == "grant_request") {
									// this.trigger("requestGrant",this._objCln[recvd.cookie].id);
									this._objCln[recvd.cookie].hide();
								} else if (this._map[recvd.cookie] == "decline_request") {
									// this.trigger("requestDecline",this._objCln[recvd.cookie].id);
									this._objCln[recvd.cookie].hide();

								} else if (this._map[recvd.cookie] == "upcoming") {
									// console.log("new upcoming event");
									// console.log(recvd.result);
									this._objCln[recvd.cookie]
											.attachEvent(recvd.result);

								} else if (this._map[recvd.cookie] == "getVevent") {
									// console.log("new upcoming event");
									// console.log(recvd.result);
									this._objCln[recvd.cookie].onResponse.call(
											this, new eventModel(recvd.result));

								}
							} else if (recvd.mesgtype == "event") {
								if (recvd.eventtype == "new_vevent") {
									this.add(recvd.vevent);
									EventsDB.add(recvd.vevent);
								} else if (recvd.eventtype == "edit_vevent") {
									this.add(recvd.vevent);
									EventsDB.add(recvd.vevent);
								} else if (recvd.eventtype == "delete_vevent") {
									console.log("delete event broadcast");
									this
											.trigger("eventremove",
													recvd.vevent.id);
								} else if (recvd.eventtype == "vevent_invite") {
									console.log("New calendar invitation:")
									// console.log(recvd.invite);
									this.trigger("addRequest", recvd.invite);
								} else if (recvd.eventtype == "vevent_reminder") {
									console.log(recvd);
									this.trigger("alert", recvd.vevent);
								}
							} else if (recvd.mesgtype == "notification") {
								this
										.trigger("notification",
												recvd.notification);
							}

							if (recvd.result)
								this.add(recvd.result);
							EventsDB.add(recvd.result);
						},
						map : function(id, obj, type) {
							this._map[id] = type;
							this._objCln[id] = obj;
						},
						clear : function() {

						},
						getEvents : function(start, end) {
							var unique = akp_ws.createUUID();
							var obj = {
								tstart : new Date(start).toISOString(),
								tend : new Date(end).toISOString(),
								mesgtype : "request",
								request : "get_vevents",
								cookie : unique,
								uid : auth.loginuserid,
								gid : auth.cgd,
								personal : false,
								service : "calendar",
							}
							akp_ws.send(obj);

						},
						changeGroup : function(group) {
							this.trigger("clear");
							EventsDB.reset();
							this.reset();
							this.start();
						}

					});

			var controller = Backbone.Model.extend({
				update : function(msg) {

				}
			});

			var inviteView = Backbone.View.extend({
				events : {
					"click .evt-go" : "accept",
					"click .evt-no" : "deny",
					"click .evt-title" : "showFull"
				},
				initialize : function(opts) {
					this.request = opts.invite;
					this.answer = opts.invitations;

					var event = this.modObj(opts.invite.vevent);
					var obj = {
						title : event.title,

						id : event.id,
						description : event.summary,
						venue : event.location,
					}

					if (event.allday) {
						obj.day = $.fullCalendar.formatDate(new Date(
								event.start), "dd");// new
													// Date(event.start).getDate(),
						obj.month = $.fullCalendar.formatDate(new Date(
								event.start), "MMM");
					} else {
						obj.day = $.fullCalendar.formatDate(new Date(
								event.start), "hh:mm");// new
														// Date(event.start).getDate(),
						obj.month = $.fullCalendar.formatDate(new Date(
								event.start), "TT");
						obj.date = $.fullCalendar.formatDate(new Date(
								event.start), "dd-MMM-yyyy")
					}
					this.obj = obj;
					this.setElement($("#calEvent-invite-template").tmpl(
							this.obj));

				},
				modObj : function(event) {
					var modelObj = event;
					modelObj.start = new Date(modelObj.tstart).toUTCString();
					modelObj.end = new Date(modelObj.tend).toUTCString();
					modelObj.className = modelObj.category;

					return modelObj;
				},
				render : function() {
					return this;
				},
				hide : function() {
					$(this.el).hide("fade");
				},
				accept : function() {
					var unique = akp_ws.createUUID();
					var obj = {
						request : "grant_request",
						mesgtype : "request",
						uid : auth.loginuserid,
						id : this.request.id,
						cookie : unique,
						service : "calendar"
					}
					// this.answer.respond();
					// grant_request

					akp_ws.send(obj);
					this.collection.map(unique, this, "grant_request");
					this.$(".evt-invite-respond").html(
							"<span class=evt-invite-ask >updating..</span>");
				},
				deny : function() {

					var unique = akp_ws.createUUID();
					var obj = {
						request : "decline_request",
						mesgtype : "request",
						uid : auth.loginuserid,
						id : this.request.id,
						cookie : unique,
						service : "calendar"
					}
					// this.answer.respond();
					// decline_request
					akp_ws.send(obj);
					this.collection.map(unique, this, "decline_request");
					this.$(".evt-invite-respond").html(
							"<span class=evt-invite-ask >updating..</span>");
				},
				showFull : function() {
				},

			});

			var MasterView = Backbone.View
					.extend({
						el : $(".cal_view"),
						settings : {
							isLoaded : false,
						},
						initialize : function() {
							_.bindAll(this, "render", 'handleCalEventSelect',
									"handleViewChange", "respondNotification",
									"generateInvite", 'changeEvent',
									'showEvent');
							var ntfy_opts = {
								el : $(".mt-menu.calendar-tab"),
								service : "calendar",
								onNotificationClick : this.respondNotification,
								className : "yellow"
							}

							this.notifications = auth
									.notificationDialog(ntfy_opts);

							var invt_opts = {
								service : "calendar",
								el : $(".calmenu.invites"),
								onInvite : this.generateInvite,
								onInviteRespond : this.respondInvitation
							};

							this.invitations = auth
									.invitationsDialog(invt_opts);

							this.nlist = new nextEvents({
								baseCollection : this.collection
							});
							this.tlist = new todaylist({
								collection : this.collection
							});

							auth.subscribe("groupInit", this.render);
							// akp_ws.appView.bind("viewChange",this.render,this);

							this.collection.bind("init", this.oninit, this);
							this.collection.bind("visible", this.render, this);
							this.collection.bind("add", this.addEvent, this);
							this.collection.bind("eventremove",
									this.removeEvent, this);
							this.collection.bind("refresh", this.refresh, this);
							this.collection.bind("notification",
									this.addNotification, this);
							this.collection.bind("showEvent",
									this.showEventById, this);
							this.collection.bind("addRequest",
									this.addInvitation, this);
							this.collection
									.bind("alert", this.alertEvent, this);
							this.collection.bind("clear", this.clearCalendar,
									this);

							var self = this;
							// setTimeout(function() {self.show();}, 2000);

							this.show();
							// this.render();
						},
						clearCalendar : function() {
							this.showView();
							$('.cal_view').fullCalendar('removeEvents');
							this.notifications.clear();
							this.invitations.clear();
							this.nlist.clear();
							this.tlist.clear();
						},
						oninit : function() {
							// this.render();
							this.notifications.init();
							this.invitations.init();
							this.nlist.render();
							$('.cal_view').fullCalendar('today');

							// var view=$('.cal_view').fullCalendar('getView');
							// this.collection.getEvents()
						},
						showView : function() {
							$(".event_mgr").hide("slide", {
								direction : "right"
							});
							$(".cal_view").show("slide", {
								direction : "left"
							});
						},
						alertEvent : function(event) {

							akp_ws.notifyOnHidden("Calendar Event Alert");

							var _self = this;

							var slider = $("<div/>")
									.append(
											"Snooze For <select class='akp-input' ><option value='5'>5 Minutes</option><option value='10'>10 Minutes</option><option value='15'>15 Minutes</option></select>")
									.addClass("snooze");

							slider
									.children("select")
									.bind(
											"change",
											function(sel) {
												var el = sel.currentTarget;
												var value = el.options[el.selectedIndex].value;
												$(
														'.snooze-dialog .ui-button-text:contains(SNOOZE)')
														.text(
																'SNOOZE('
																		+ value
																		+ ')');
											})

							$("<div/>")
									.addClass("snooze-dialog")
									.append(
											event.summary
													+ "<br/>"
													+ event.location
													+ "<br/>"
													+ "is going to start now ... <br/>")
									.append(slider)
									.dialog(
											{
												title : event.title,
												modal : true,
												height : "200",
												width : "350",
												closeOnEscape : false,
												resizable : false,
												draggable : false,
												dialogClass : "snooze-dialog",
												buttons : [
														{
															text : "Ok",
															click : function() {
																$(this)
																		.dialog(
																				"close")
																		.remove();
															},
															"class" : "btn btn-primary"
														},
														{
															"class" : "btn btn-success",
															text : "SNOOZE(5)",
															click : function() {
																// _self.snoozeAlert(slider.slider("value"),event.id);
																var snoozeval = slider
																		.children(
																				"select")
																		.val();
																_self
																		.snoozeAlert(
																				snoozeval,
																				event.id);
																$(this)
																		.dialog(
																				"close")
																		.remove();
															}
														} ],
												close : function() {
												},

											});
							// $('.snooze-dialog
							// .ui-button-text:contains(CANCEL)').text('CLOSE');
						},
						snoozeAlert : function(val, id) {
							console.log("sending snooze request");
							var unique = akp_ws.createUUID();

							var obj = {
								cookie : unique,
								service : "calendar",
								mesgtype : "request",
								request : "snooze",
								id : id,
								uid : auth.loginuserid,
								snooze : val,
							}
							akp_ws.send(obj);

						},
						generateInvite : function(invite) {
							console.log(invite);
							var invite = new inviteView({
								invite : invite,
								collection : this.collection,
								invitations : this.invitations
							});

							return invite.render().el;

						},
						addInvitation : function(invite) {
							this.invitations.attachRequest(invite);
						},

						respondInvitation : function() {

						},

						respondNotification : function(obj) {
							// console.log(obj);
							/*
							 * var model=this.collection.get(obj.vevent);
							 * this.showEvent(this.getEventObj(model));
							 */
							this.showEventById(obj.vevent);
						},
						addNotification : function(notification) {
							this.notifications.attachNotification(notification,
									"inc");
						},
						getEventObj : function(model) {
							if (!model)
								return;

							var modelObj = model.toJSON();
							modelObj.start = new Date(modelObj.tstart);
							modelObj.end = new Date(modelObj.tend);
							modelObj.className = modelObj.category;

							if (modelObj.allday == true
									|| modelObj.allday == false)
								modelObj.allDay = modelObj.allday;

							return modelObj;
						},
						addEvent : function(model) {
							var self = this;
							model.bind("change", function() {
								self.changeEvent(model);
							}, this);
							var modelObj = this.getEventObj(model);

							// console.log(modelObj);

							$('.cal_view').fullCalendar('renderEvent',
									modelObj, true);
						},
						changeEvent : function(model) {
							var modelObj = this.getEventObj(model);

							// console.log(modelObj);

							$('.cal_view').fullCalendar('renderEvent',
									modelObj, true);
						},
						removeEvent : function(id) {
							$('.cal_view').fullCalendar('removeEvents', id);
							// this.collection.trigger("refresh");
							EventsDB.get(id).set({
								"deleted" : true
							});
						},
						refresh : function() {
							this.handleViewChange($('.cal_view').fullCalendar(
									'getView'));
						},
						render : function() {

							$('.cal_view').fullCalendar('render');

							return this;

						},

						show : function() {
							var h = $("#fcal").height();
							var date = new Date();
							var d = date.getDate();
							var m = date.getMonth();
							var y = date.getFullYear();

							this.calendar = $('.cal_view')
									.fullCalendar(
											{
												editable : true,
												theme : false,
												header : {
													center : "title",
													right : "prev,month,agendaWeek,agendaDay,next",
													left : "today,{team:"
															+ this.handleCalShift
															+ "}"
												},
												defaultView : 'month',
												weekMode : "liquid",
												selectable : true,
												selectHelper : true,
												viewDisplay : this.handleViewChange,
												windowResize : this.render,
												eventClick : this.showEvent,
												disableDragging : true,
												disableResizing : true,
												select : this.handleCalEventSelect,
												eventRender : this.handleEventRender,
												height : h,
												// events : events,
												ignoreTimezone : false

											});
							$(".cal_view").fullCalendar("today");
							// this.render();

							// var tlist = new
							// todaylist({collection:this.collection});

							// var invlist= new
							// EventInvitations({eventCollection:this.collection});
							// this.addCustomButtons();

						},

						addCustomButtons : function() {
							var custom_buttons = ''
									+ '<span  class="fc-button fc-state-default fc-corner-left fc-state-active" unselectable="on">Group</span>'
									+ '<span  class="fc-button fc-state-default  " unselectable="on" >Personal</span>'
									+
									// '<span class="fc-button fc-state-default
									// fc-corner-right" unselectable="on"
									// >All</span>'+
									'';
							$('.fc-header-left').append(custom_buttons);
						},
						handleCalShift : function() {

						},
						handleEventRender : function(ev, el, view) {
							/*
							 * var debug; debug=true; var
							 * title=el.find(".fc-event-title").after("<br/>");
							 * el.find(".fc-event-time").addClass("icon-clock").before(title);
							 */

						},
						handleViewChange : function(view) {
							// console.log(view.title);

							this.clearAll();
							$('.cal_view').fullCalendar('renderEvents');
							this.collection.getEvents(view.visStart,
									view.visEnd);

						},
						clearAll : function() {
							$('.cal_view').fullCalendar('removeEvents');
							this.collection.reset();
						},
						handleCalWindowResize : function() {

						},
						showEventById : function(id) {
							// var model=this.collection.get(id);
							var model = EventsDB.get(id);
							if (model) {
								showEview.render(model);
							} else {
								this.getEvent(id).onResponse = function(model) {
									EventsDB.add(model);
									showEview.render(model);
								};
							}

							// this.showEvent(this.getEventObj(model));
						},
						getEvent : function(id) {
							var unique = akp_ws.createUUID();
							var obj = {
								cookie : unique,
								mesgtype : "request",
								request : "get_vevent",
								id : id,
								uid : auth.loginuserid,
								gid : auth.cgd,
								personal : false,
								service : "calendar",
							}
							akp_ws.send(obj);
							this.collection.map(obj.cookie, obj, "getVevent");
							return obj
						},
						showEvent : function(calEvent, jsEvent, view) {
							// alert('Event: ' + calEvent.title);
							// alert('Coordinates: ' + jsEvent.pageX + ',' +
							// jsEvent.pageY);
							// alert('View: ' + view.name);

							// change the border color just for fun
							// $(this).css('border-color', 'red');

							/*
							 * var event = new eventModel(calEvent);
							 * showEview.render(event);
							 */

							this.showEventById(calEvent.id);

						},
						handleCalEventSelect : function(start, end, allDay,
								jsEvent, view) {
							$('.cal_view').fullCalendar('unselect');
							var dt = new Date();
							dt.setDate(dt.getDate() - 1);
							var dtm = new Date();
							dtm.setMinutes(dtm.getMinutes()); // TODO : put
																// decrement
																// want to
																// create event
																// in past time
							if (dt > start && allDay) {
								return false;
							} else if (start < dtm && !allDay) {
								return false

							} else {
								var event = new eventModel({
									start : start,
									end : end,
									allDay : allDay
								});

								newEView.render(event, jsEvent).show();
								// this.$el.hide("slide",{direction:"left"});
								// $(".event_mgr").show("slide",{direction:"right"});
							}

						}

					});

			var timezone = Backbone.View.extend({
				initialize : function() {
					this.template = $("#timezone-template").tmpl();
					this.$el.append(this.template);
					var timezone = new Date().getTimezoneOffset();
					var GMTinHours = utils.min2hours(timezone);
					var defaultTzone = this.$(
							".akp-tzone-list-val:contains(" + GMTinHours + ")")
							.html();
					this.$(".akp-tzone-ivalue").val(defaultTzone);
				},
				render : function() {
					return this;
				},
				getTimeZone : function() {
					return this.$(".akp-tzone-ivalue").val();
				}
			});

			var showEventView = Backbone.View
					.extend({
						className : "showCalEvent",
						events : {
							"click .evtDelete" : "eventRemove",
							"click .evtEdit" : "goEdit",
							"click .closeIcon" : "hidePanel",
							"click .evtdrop" : "renderModel",
							"click .evtsave" : "saveEvent",
						},
						initialize : function() {
							_.bindAll(this, "render", "renderModel",
									"shareEventKons", "saveEvent");
							var card = $("<div />").addClass("calEventCard");
							var entry = $("<div />").addClass("calKonsEntry");
							var list = $("<div />").addClass("calEventKons");
							this.$el.appendTo(".event_mgr").append(card)
									.append(entry).append(list).hide();
							this.collection.bind("init", this.getKonsDialog,
									this);
							this.collection.bind("init", this.getKonsStream,
									this);
							this.collection.bind("clear", this.hidePanel, this);
							// this.model.bind("change",this.renderModel,this);

							this.$el.dialog({
								modal : true,
								resizable : false,
								draggable : false,
								open : this.dialogOpenWithoutTitle,
								autoOpen : false,
								minWidth : 600,
								position : [ 'center', 50 ],
								/*hide : {
									effect : 'blind',
									duration : 250
								},
								show : {
									effect : 'blind',
									duration : 1000
								},*/
							});

						},
						dialogOpenWithoutTitle : function() {
							var $dialog = $(this);
							$dialog.closest(".ui-dialog").find(
									".ui-dialog-titlebar").remove();

							$dialog.css({
								padding : "0"
							}).closest(".ui-dialog").css({
								padding : "0"
							});
							// get the last overlay in the dom
							$dialogOverlay = $(".ui-widget-overlay").last();
							// remove any event handler bound to it.
							$dialogOverlay.unbind();
							$dialogOverlay.click(function() {
								// close the dialog whenever the overlay is
								// clicked.
								// if($dialog.attr("data-loaded") == "true")
								$dialog.dialog("close");
							});
						},
						getKonsDialog : function() {
							this.konsEntry = akp_ws.konsDialog({
								el : this.$(".calKonsEntry"),
								type : "standard",
								onShare : this.shareEventKons,
								onCancel : this.clearKonsEntry,
								"basic" : "true",
								richText : false,
							});
						},
						hideKonsEntry : function() {
							this.$(".calKonsEntry").hide();
							this.$(".calEventKons").show();
						},
						showKonsEntry : function() {
							this.$(".calKonsEntry").show();
							this.$(".calEventKons").hide();
						},
						getKonsStream : function() {
							this.konsStream = akp_ws.kons.getKonsStream({
								el : this.$(".calEventKons"),
								basic : true,
								richText : false,
								strictCategory : "calendar",
								onUpdates : this.hideKonsEntry,
							});
							akp_ws.kons.getCategoryUpdates("calendar",
									this.konsStream.updates);
						},
						getEventKons : function(id) {
							this.konsStream.getKonv(id);
						},
						render : function(evt) {
							if (evt)
								this.model = evt;

							this.renderModel();

						},
						renderModel : function() {
							if (!this.model) {
								noty({
									text : "Sorry! event data not available.",
									type : "error",
									timeout : 5000,
									layout : "bottomRight",

								});
								return;
							}

							this.model.bind("change", this.renderModel, this);
							this.mobj = this.model.toJSON();

							this.mobj.start = new Date(this.mobj.tstart);
							this.mobj.end = new Date(this.mobj.tend);
							this.mobj.className = this.mobj.category;

							if (this.mobj.allday == true
									|| this.mobj.allday == false)
								this.mobj.allDay = this.mobj.allday;

							this.mobj.startdate = $.fullCalendar.formatDate(
									this.mobj.start, "yyyy-MM-dd");
							this.mobj.enddate = $.fullCalendar.formatDate(
									this.mobj.end, "yyyy-MM-dd");
							this.mobj.starttime = $.fullCalendar.formatDate(
									this.mobj.start, "hh:mm TT");
							this.mobj.endtime = $.fullCalendar.formatDate(
									this.mobj.end, "hh:mm TT")
							this.mobj.viewtype = this.getViewType(this.mobj);
							this.mobj.isOwner = this
									.isOwner(this.mobj.owner_uid);
							this.mobj.venue = this.mobj.location;
							this.mobj.allDay = this.mobj.allday;

							this.renderEvent(this.mobj);

							if (this.mobj.kons) {
								this.hideKonsEntry();
								this.getEventKons(this.mobj.kons);
							} else {
								this.showKonsEntry();
							}
						},
						renderEvent : function(obj) {
							this.showPanel();
							obj.expired = obj.start < new Date() ? true : false;

							if (obj.attachments)
								obj.hasAttachments = obj.attachments.length ? true
										: false;
							else
								obj.hasAttachments = false;
							var created = auth.getuserinfo(obj.owner_uid);

							obj.userid = created.uid;
							obj.img = created.image_medium
									|| "css/images/user48.png";
							obj.owner_name = created.first_name;

							var template = $("#showEvent-template").tmpl(
									[ obj ]);
							this.$(".calEventCard")
									.removeClass("onfly editing").show().html(
											template);

							if (obj.expired) {
								this.disableEdit();
							}

							if (obj.hasAttachments) {
								this.renderAttachments(obj.attachments);
							}

							if (!obj.limited) {
								this.$(".sevt-invite-stage").append("Group");
							} else {
								this.renderMembers({
									el : this.$(".sevt-invite-stage"),
									members : obj.invited
								});
							}

							if (!obj.accepted.length) {
								this.$(".sevt-accept-stage").append(
										"No one responded!");
							} else {
								this.renderMembers({
									el : this.$(".sevt-accept-stage"),
									members : obj.accepted
								});
							}

							this.$el.show();
						},
						saveEvent : function() {

							if (!this.modelObj.title)
								return;

							var unique = akp_ws.createUUID();
							var obj = {
								service : "calendar",
								mesgtype : "request",
								request : "edit_vevent",
								cookie : unique,
								personal : false,
								uid : auth.loginuserid,
							}

							var request = $.extend({}, this.modelObj, obj);

							console.log(request);

							akp_ws.send(request);

							this.renderModel();

						},
						disableEdit : function() {
							this.$(".evtcontrol").hide();
						},
						renderAttachments : function(collection) {

							this.attachments = akp_ws.FilesViewer({
								el : this.$(".sevt-attach-stage"),
								files : collection
							});
						},
						renderMembers : function(opts) {

							// console.log(opts.members);
							var members = opts.members;

							for ( var i = 0; i < members.length; i++) {
								var user = auth.getuserinfo(members[i]);
								var obj = {
									userid : user.uid,
									img : user.image_small
											|| "css/images/user32.png",
								}
								var temp = $("#user-template").tmpl([ obj ]);
								temp.attr("title", user.first_name);
								opts.el.append(temp);
							}

						},
						isOwner : function(uid) {
							return uid == auth.loginuserid ? true : false;
						},
						getViewType : function(ev) {
							var type;
							if (ev.allDay) {
								if (new Date(ev.startdate)
										- new Date(ev.enddate))
									type = "period";
								else
									type = "day"
							} else {
								type = "hours"
							}
							return type;
						},
						showPanel : function() {
							// Approach deprecated on request

							/*
							 * $(".cal_view").hide("slide",{direction:"left"});
							 * $(".event_mgr").show("slide",{direction:"right"});
							 */

							// Show Dialog using JQuery UI Dialog
							this.$el.dialog("open");

						},
						eventRemove : function() {
							var vevent = this.model.toJSON();
							if (vevent.original_event) {
								this.handleRecurEventRemove(vevent);
								return;
							} else if (vevent.recurring != "none") {

							}
							this.deleteReq(vevent, false);

							// $('.cal_view').fullCalendar("removeEvents",obj.id);

						},
						deleteReq : function(event, recurring) {
							var unique = akp_ws.createUUID();
							var obj = {
								mesgtype : "request",
								request : "delete_vevent",
								id : event.id,
								cookie : unique,
								service : "calendar",
								uid : auth.loginuserid,
							}
							if (recurring != undefined)
								obj.recurring = recurring;

							akp_ws.send(obj);
							this.collection.map(unique, obj, "delete");

							if (event.kons)
								this.konsStream.deleteKons(event.kons);

							this.hidePanel();
						},
						warnForNonRecurEventRemove : function() {

						},
						handleRecurEventRemove : function(event) {
							var _self = this;

							// <br/>* yes to delete all instances<br />* no to
							// to delete this instance <br/>

							$("<div/>")
									.addClass("snooze-dialog")
									.append(
											"<span>" + event.location
													+ "</span><br/>"
													+ "is repeating event ...")
									.dialog(
											{
												title : event.title,
												modal : true,
												height : "200",
												width : "350",

												buttons : [
														{
															text : "Delete All occurences",
															click : function() {
																_self
																		.deleteReq(
																				event,
																				true);
																$(this)
																		.dialog(
																				"close")
																		.remove();
															},
															"class" : "btn greenbtn"
														},
														{
															"class" : "btn blue",
															text : "Delete just this occurence",
															click : function() {
																_self
																		.deleteReq(
																				event,
																				false);
																$(this)
																		.dialog(
																				"close")
																		.remove();
															}
														},
														{
															text : "Cancel",
															"class" : "btn redbtn",
															click : function() {
																$(this)
																		.dialog(
																				"close")
																		.remove();
															}
														} ],
												close : function() {
												},
												resizable : false,
												draggable : false,
												closeOnEscape : false,
												dialogClass : "snooze-dialog",
											});
						},
						hidePanel : function() {
							if (this.model)
								this.model.unbind("change", this.renderModel);
							/*
							 * Deprecated apprach
							 * $(".event_mgr").hide("slide",{direction:"right"});
							 * $(".cal_view").show("slide",{direction:"left"});
							 * this.$el.hide();
							 */

							this.$el.dialog("close");
						},
						/*
						 * Read View
						 */
						shift2ReadView : function() {
							this.$(".calEventCard")
									.removeClass("onfly editing");
						},

						/*
						 * Edit and remove
						 */

						goEdit : function() {
							this.shift2EditView();
							// this.$el.hide("slide",{direction:"up"});
							// newEView.render(this.model).show("slide",{direction:"down"});

						},
						shift2EditView : function() {
							var el = this.$(".calEventCard");
							var modelObj = this.model.toJSON();
							this.modelObj = modelObj;
							el.addClass("editing");
							var self = this;

							el.find(".evtfield-desc").attr("contentEditable",
									true).keyup(
									function(e) {
										self.modelObj.summary = $(
												e.currentTarget).text();
									});

							el
									.find(".title")
									.attr("contentEditable", true)
									.keyup(
											function(e) {
												self.modelObj.title = $(
														e.currentTarget).text();
											});

							var loctext = $(
									'<input type="text" value="'
											+ modelObj.location
											+ '" class="" placeholder="Location" />')
									.keyup(
											function(e) {
												self.modelObj.location = $(
														e.currentTarget).val();
											});

							el.find(".sevtloc").children(".evtfield").remove()
									.end().append(loctext);
							el.find(".sevttype").children(".evtfield-type")
									.remove().end().append(
											this.getEvtType(modelObj.category));
							el
									.find(".sevtreminder")
									.children(".evtfield-reminder")
									.remove()
									.end()
									.append(
											this
													.getEvtRepeat(modelObj.recurring))
						},
						getEvtType : function(selected) {
							var types = [ "Meeting", "BirthDay" ];
							var self = this;
							var selector = $("<select/>").addClass("");
							for ( var i in types) {
								selector.append("<option   value='" + types[i]
										+ "'>" + types[i] + "</option>");
							}

							selector.children(
									"option[value='" + selected + "']").attr(
									"selected", "selected");

							selector
									.bind(
											"change",
											function(sel) {
												self.modelObj.category = sel.currentTarget.options[sel.currentTarget.selectedIndex].value;
											});

							return selector;

						},
						getEvtRepeat : function(reminder) {
							var self = this;
							var types = [ "Never", "Every Day", "Every Week",
									"Every Month" ];
							var values = [ "none", "daily", "weekly", "monthly" ];
							var selector = $("<select/>").addClass("");

							for ( var i in types) {
								selector.append("<option value='" + values[i]
										+ "' >" + types[i] + "</option>");
							}
							selector.children(
									"option[value='" + reminder + "']").attr(
									"selected", "selected");

							selector
									.bind(
											"change",
											function(sel) {
												self.modelObj.recurring = sel.currentTarget.options[sel.currentTarget.selectedIndex].value;
											});

							return selector;
						},
						/*
						 * Event konversations
						 */

						shareEventKons : function(konsObj) {
							konsObj.category = "calendar";
							konsObj.attached_object = this.model.get("id");
							akp_ws.send(konsObj);
						},
						clearKonsEntry : function() {

						}

					});

			var createEventView = Backbone.View
					.extend({

						className : "newCalEvent",
						initialize : function() {
							_.bindAll(this, "renderMax", "hideAccessOpts",
									"setUsers", "saveEvent");
							this.$el.appendTo(".event_mgr").hide();
							this.collection.bind("clear", this.hide, this);
							$(document).click(this.hideAccessOpts);

						},
						events : {
							"click .savebtn" : "saveEvent",
							"click .cancelbtn" : "hide",
							"click .evtbig" : "renderMax",
							"click .accessChangeBtn" : "showAccessOpts",
							"click .opt" : "selectMode",
							"click .accessUserbrowser" : "userBrowser"
						},
						render : function(model, pos) {
							this.model = model;
							this.mobj = this.model.toJSON();

							this.mobj.startdate = $.fullCalendar.formatDate(
									this.mobj.start, "yyyy-MM-dd");
							this.mobj.enddate = $.fullCalendar.formatDate(
									this.mobj.end, "yyyy-MM-dd");
							this.mobj.starttime = $.fullCalendar.formatDate(
									this.mobj.start, "hh:mm TT");
							this.mobj.endtime = $.fullCalendar.formatDate(
									this.mobj.end, "hh:mm TT")
							this.mobj.viewtype = this.getViewType(this.mobj);

							return this.renderMax(this.mobj, pos)

						},
						renderMin : function(obj, pos) {
							this.$el.addClass("onfly").appendTo(".cal_view");
							var template = $("#newEventMin-template").tmpl(
									[ obj ]);
							return this.$el.show().html(template).css({
								top : pos.pageY,
								left : pos.pageX
							});
						},
						renderMax : function(obj) {

							this.showMax();
							var obj = obj.viewtype ? obj : this.mobj;

							this.$el.appendTo(".event_mgr");
							var template = $("#newEvent-template")
									.tmpl([ obj ]);
							this.$el.removeClass("onfly").html(template);

							this.userInput = contacts.selector({
								el : this.$(".accessUsersList")
							}).render();
							this.$(".accessUsers").hide();
							this.timezone = new timezone({
								el : this.$(".evt-timezone")
							});

							this.attachments = akp_ws.FSDialog({
								el : this.$(".evt-attach-btn"),
								container : this.$(".evt-attach-container"),
								onAdd : this.showAttachments,
							})

							this.selectType(obj.className);
							this.selectReminder(obj.reminder);
							this.showInvitees(obj.invitees);

							this.$(".evtname").focus();

							return this.$el;

						},
						selectType : function(type) {
							if (!type)
								return;
							if (!type.length)
								return;

							this.$('.evttype option:contains(' + type[0] + ')')
									.attr("selected", "selected").siblings()
									.removeAttr("selected");
						},
						selectReminder : function(reminder) {
							if (!reminder)
								return;
							this.$(
									'.evtreminder option:contains("' + reminder
											+ '")')
									.attr("selected", "selected").siblings()
									.removeAttr("selected");
						},
						showInvitees : function(invitees) {
							if (!invitees)
								return;
							if (!invitees.length)
								return;
						},
						showAttachments : function() {
							this.$(".evt-attachements").show();
						},
						showMax : function() {
							$(".cal_view").hide("slide", {
								direction : "left"
							});
							$(".event_mgr").show("slide", {
								direction : "right"
							});
						},
						hide : function() {
							this.$el.hide();
							$(".event_mgr").hide("slide", {
								direction : "right"
							});
							$(".cal_view").show("slide", {
								direction : "left"
							});
						},
						saveEvent : function() {
							var event = this.validate();
							if (event) {
								this.hide();
								// $('.cal_view').fullCalendar('renderEvent',
								// event);

							} else
								return false;

							var unique = akp_ws.createUUID();
							var endUTC = event.end ? new Date(event.end)
									.toISOString() : new Date(event.start)
									.toISOString();
							var obj = {
								cookie : unique,
								service : "calendar",
								mesgtype : "request",
								request : "add_vevent",
								personal : false,
								uid : auth.loginuserid,
								gid : auth.cgd,
								category : this.$('.evttype').val(),

								// attachments :listcopy(msg.attachments),
								recurring : this.$('.evtreminder').val(),
								tstart : new Date(event.start).toISOString(),
								tend : endUTC,
								title : this.$(".eventname").val(),
								summary : this.$(".eventnote").text(),
								location : this.$(".eventloc").val(),
								invited : this.userInput.getSelected(),
								timezone : this.timezone.getTimeZone(),
								allday : event.allDay,
								attachments : this.attachments.getFileList(),
							};

							if (!obj.invited.length) {
								obj.invited = contacts.getGroupList();
								obj.limited = false;
							} else {
								obj.limited = true;
							}
							console.log(obj);

							akp_ws.send(obj);
							this.collection.trigger("refresh");
						},
						validate : function() {
							var title = this.$(".eventname").val();
							var event = this.model.toJSON();
							if (!title) {
								this.$(".evtErrMsg").html(
										"* Enter event name to save");
								return false;
							} else {
								event.title = title;
							}

							event.className = $("#evttype").val();// type
							event.venue = $(".eventloc").val();// location
							event.description = $(".eventnote").text();
							event.reminder = $(".evtreminder").val();
							event.invitees = this.userInput.getSelected();
							return event;

						},
						getViewType : function(ev) {
							var type;
							if (ev.allDay) {
								if (new Date(ev.startdate)
										- new Date(ev.enddate))
									type = "period";
								else
									type = "day"
							} else {
								type = "hours"
							}
							return type;
						},
						userBrowser : function() {

							var browser = contacts.browser({
								onFinish : this.setUsers
							});
							var existUsers = this.userInput.getSelected();
							browser.selectUsers(existUsers);
						},
						setUsers : function(users) {
							this.userInput.reset().addUsers(users);

						},
						showAccessOpts : function(e) {
							e.stopPropagation();
							e.preventDefault();
							this.$(".accessChangeOpts").show();
						},
						selectMode : function(e) {
							this.hideAccessOpts();

							var mode = $(e.currentTarget).attr("data-mode");
							var prev = this.$(".accessChangeOpts").data("mode");
							if (mode == prev)
								return;

							this.switchMode(mode);

						},
						switchMode : function(mode) {

							this.setMode(mode)
							if (mode == "private")
								this.showUserSelector()
							else
								this.hideUserSelector();
						},
						setMode : function(mode) {
							// this.settings.mode=mode;
							var classname = (mode == "public") ? "icon-earth"
									: "icon-users-2";
							this.$(".follow-mode").removeClass(
									"icon-earth icon-users-2").addClass(
									classname);
							this.$(".accessChangeOpts").data("mode", mode);
						},
						hideAccessOpts : function(e) {

							this.$(".accessChangeOpts").hide();
						},
						showUserSelector : function() {
							this.$(".accessUsers").show();
							this.userInput.getFocus();
						},

						hideUserSelector : function() {
							this.$(".accessUsers").hide();
							this.userInput.reset();
						},
					});

			var daysCollection = Backbone.Collection.extend({
				model : eventModel,
				initialize : function() {
					// console.log("days collection initialized");
				}
			});

			var todaylist = Backbone.View
					.extend({
						el : $(".todayevents"),
						events : {
							"click .evt-title" : "showEvent"
						},
						initialize : function() {

							_.bindAll(this, "render");

							this.loaded = false;
							this.collection.bind("add", this.render2dayEvent,
									this);
							// $(".daylist").hide();

							/*
							 * this.events =
							 * $('.cal_view').fullCalendar('clientEvents',
							 * function(event) {
							 * 
							 * });
							 * 
							 * this.render();
							 */
						},
						is2dayEvent : function(event) {
							var date = new Date();
							var date1 = new Date(date.getFullYear(), date
									.getMonth(), date.getDate());
							var date2 = new Date(date.getFullYear(), date
									.getMonth(), date.getDate() + 1);
							var start = new Date(event.start);
							return start >= date1 && start < date2;
						},
						render : function() {

							for (event in events) {

								// $(".calmenulist ul").append(item.clone());
							}

						},
						modObj : function(model) {
							var modelObj = model.toJSON();
							modelObj.start = new Date(modelObj.tstart)
									.toUTCString();
							modelObj.end = new Date(modelObj.tend)
									.toUTCString();
							modelObj.className = modelObj.category;
							return modelObj;
						},
						render2dayEvent : function(model) {
							var event = this.modObj(model);

							if (!this.is2dayEvent(event))
								return;

							if (this.isExisting(event.id))
								return;
							// $(".daylist").show();

							var obj = {
								title : event.title,
								day : $.fullCalendar.formatDate(new Date(
										event.start), "hh:mm "),// new
																// Date(event.start).getDate(),
								month : $.fullCalendar.formatDate(new Date(
										event.start), "TT"),
								id : event.id,
								description : event.summary,
								venue : event.location,
							}

							var item = $("<li/>").append(
									$("#calEvent-template").tmpl(obj));

							if (!this.loaded) {
								this.loaded = true;
								this.$('ul').empty();
							}

							this.$(".empty-evt").remove();
							this.$('ul').append(item);
						},
						isExisting : function(id) {
							return this.$("li>div[data-evtid=" + id + "]").length;
						},
						showEvent : function(e) {
							var evtid = $(e.currentTarget).closest(
									"div.calevent").data("evtid");
							this.collection.trigger("showEvent", evtid);
						},
						showEmptyMsg : function() {
							$(
									'<li class="empty-evt"><div class="calevent empty-invite" >No Events</div></li>')
									.appendTo(this.$("ul"));
						},
						clear : function() {
							this.$('ul').empty();
							this.showEmptyMsg();
						}
					})

			var nextEvents = Backbone.View
					.extend({
						el : $(".calmenu.upcoming"),
						events : {
							"click .evt-title" : "showEvent",
							"scroll .calmenulist" : "getMore"
						},
						settings : {
							marker : 0,
							lastTimestamp : 0,
							lastTop : 0,
						},
						initialize : function(opts) {

							_.bindAll(this, "render", "attachEvent",
									"showEvent", "getMore");
							this.baseCollection = opts.baseCollection;
							this.collection = new daysCollection;
							this.collection.bind("add",
									this.renderNextdayEvent, this);
							this.$(".calmenulist").bind("scroll", this.getMore);
							this.loaded = false;

							// $(".calmenu.upcoming").hide();

						},
						render : function() {
							this.getRequestForUpcomingEvents();
							return this;
						},
						renderEvent : function() {
							console.log("testing upcoming events");
						},
						getRequestForUpcomingEvents : function(marker) {
							var unique = akp_ws.createUUID();

							var obj = {
								service : "calendar",
								mesgtype : "request",
								request : "get_upcoming",
								uid : auth.loginuserid,
								cookie : unique,
								personal : false,
							}

							if (marker) {
								obj.marker = marker;
								// console.log("request for upcoming with
								// marker");
							}
							akp_ws.send(obj);

							this.baseCollection.map(unique, this, "upcoming");
						},
						getMore : function() {
							var top = this.$(".calmenulist").scrollTop();
							var scrollheight = this.$(".calmenulist")[0].scrollHeight;// this.$el.height();
							var offsetheight = this.$(".calmenulist")[0].offsetHeight
							var contentheight = scrollheight - offsetheight;
							// var docHeight=$(document).height();
							if (top > this.settings.lastTop) {

								// if(top+ height > docHeight-50 ) {
								if (contentheight < top + 50) {
									var id = this.$("li:last-child").children(
											".calevent").attr("data-evtid");
									var model = this.collection.get(id);
									// console.log(model.toJSON());
									var marker = model.toJSON().tstart;

									if (marker != this.settings.marker) {

										this
												.getRequestForUpcomingEvents(marker);
										this.settings["marker"] = marker;
									}
								}
							}
							this.settings.lastTop = top;
							return;
						},
						attachEvent : function(obj) {

							this.collection.add(obj);
							EventsDB.add(obj);
						},
						modObj : function(model) {
							var modelObj = model.toJSON();
							modelObj.start = new Date(modelObj.tstart)
									.toUTCString();
							modelObj.end = new Date(modelObj.tend)
									.toUTCString();
							modelObj.className = modelObj.category;
							return modelObj;
						},
						isNextdayEvent : function(event) {

							var start = new Date(event.start);
							return start >= this.date1; // && start <
														// this.date2;
						},
						renderNextdayEvent : function(model) {
							var event = this.modObj(model);

							/*
							 * if(!this.isNextdayEvent(event)) return;
							 */
							if (this.isExisting(event.id))
								return;

							// $(".calmenu.upcoming").show();

							var obj = {
								title : event.title,
								id : event.id,
								description : event.summary,
								venue : event.location,
							}

							if (event.allday) {
								obj.day = $.fullCalendar.formatDate(new Date(
										event.start), "dd");// new
															// Date(event.start).getDate(),
								obj.month = $.fullCalendar.formatDate(new Date(
										event.start), "MMM");
								obj.date = "Full Day";
							} else {
								obj.day = $.fullCalendar.formatDate(new Date(
										event.start), "dd");// new
															// Date(event.start).getDate(),
								obj.month = $.fullCalendar.formatDate(new Date(
										event.start), "MMM");
								obj.date = $.fullCalendar.formatDate(new Date(
										event.start), "hh:mmTT ")
							}

							var item = $("<li/>").append(
									$("#calEvent-template").tmpl(obj));

							if (!this.loaded) {
								this.$("ul").empty();
								this.loaded = true;
							}

							this.$(".empty-evt").remove();
							this.$("ul").append(item);
						},
						showEvent : function(e) {
							var evtid = $(e.currentTarget).closest(
									"div.calevent").data("evtid");
							this.baseCollection.trigger("showEvent", evtid);
						},
						isExisting : function(id) {
							return this.$("li>div[data-evtid=" + id + "]").length;
						},
						showEmptyMsg : function() {
							$(
									'<li class="empty-evt"><div class="calevent empty-invite" >No Events</div></li>')
									.appendTo(this.$("ul"));
						},
						clear : function() {
							this.collection.reset();
							this.$("ul").empty();
							this.showEmptyMsg();
						}
					});

			var collection = new baseCollection;

			var calView = new MasterView({
				collection : collection
			});

			var newEView = new createEventView({
				collection : collection
			});
			var showEview = new showEventView({
				collection : collection,
			});

			return collection;

		});
