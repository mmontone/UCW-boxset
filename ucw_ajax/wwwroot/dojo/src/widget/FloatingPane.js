/*
	Copyright (c) 2004-2006, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/community/licensing.shtml
*/

dojo.provide("dojo.widget.FloatingPane");

dojo.require("dojo.widget.*");
dojo.require("dojo.widget.Manager");
dojo.require("dojo.html.*");
dojo.require("dojo.html.layout");
dojo.require("dojo.html.iframe");
dojo.require("dojo.html.selection");
dojo.require("dojo.lfx.shadow");
dojo.require("dojo.widget.html.layout");
dojo.require("dojo.widget.ContentPane");
dojo.require("dojo.dnd.HtmlDragMove");
dojo.require("dojo.widget.Dialog");		// for ModalFloatingPane
dojo.require("dojo.widget.ResizeHandle");
dojo.require("dojo.widget.LayoutContainer");

dojo.declare(
	"dojo.widget.FloatingPaneBase",
	null,
	{
		// summary
		//	Base class for FloatingPane, ModalFloatingPane

		// title: String
		//	text to display in floating pane's title bar (ex: "My Window")
		title: '',

		// iconSrc: String
		//	path of icon to display in floating pane's title bar
		iconSrc: '',

		// hasShadow: Boolean
		//	if true, display a shadow behind the floating pane
		hasShadow: false,

		// constrainToContainer: Boolean
		//	if true, and the floating pane is inside another container (ContentPane, another FloatingPane, etc.),
		//	then don't allow the floating pane to be dragged outside of it's container
		constrainToContainer: false,

		// taskBarId: String
		//	widget id of TaskBar widget;
		//	if specified, then an icon for this FloatingPane will be added to the specified TaskBar
		taskBarId: "",

		// resizable: Boolean
		//	if true, allow user to resize floating pane
		resizable: true,

		// titleBarDisplay: Boolean
		//	if true, display title bar for this floating pane
		titleBarDisplay: true,

		// windowState: String
		//	controls whether window is initially not displayed ("minimized"), displayed full screen ("maximized"),
		//	or just displayed normally ("normal").
		// Values
		//	"normal", "maximized", "minimized"
		windowState: "normal",

		// displayCloseAction: Boolean
		//	display button to close window
		displayCloseAction: false,

		// displayMinimizeAction: Boolean
		//	display button to minimize window (ie, window disappears so only the taskbar item remains)
		displayMinimizeAction: false,

		// displayMaximizeAction: Boolean
		//	display button to maximize window (ie, to take up the full screen)
		displayMaximizeAction: false,

		// Related to connecting to taskbar
		// TODO: use topics rather than repeated connect attempts?
		_max_taskBarConnectAttempts: 5,
		_taskBarConnectAttempts: 0,

		templateString:"<div id=\"${this.widgetId}\" dojoAttachEvent=\"onMouseDown\" class=\"dojoFloatingPane\">\n\t<div dojoAttachPoint=\"titleBar\" class=\"dojoFloatingPaneTitleBar\"  style=\"display:none\">\n\t  \t<img dojoAttachPoint=\"titleBarIcon\"  class=\"dojoFloatingPaneTitleBarIcon\">\n\t\t<div dojoAttachPoint=\"closeAction\" dojoAttachEvent=\"onClick:closeWindow\"\n   \t  \t\tclass=\"dojoFloatingPaneCloseIcon\"></div>\n\t\t<div dojoAttachPoint=\"restoreAction\" dojoAttachEvent=\"onClick:restoreWindow\"\n   \t  \t\tclass=\"dojoFloatingPaneRestoreIcon\"></div>\n\t\t<div dojoAttachPoint=\"maximizeAction\" dojoAttachEvent=\"onClick:maximizeWindow\"\n   \t  \t\tclass=\"dojoFloatingPaneMaximizeIcon\"></div>\n\t\t<div dojoAttachPoint=\"minimizeAction\" dojoAttachEvent=\"onClick:minimizeWindow\"\n   \t  \t\tclass=\"dojoFloatingPaneMinimizeIcon\"></div>\n\t  \t<div dojoAttachPoint=\"titleBarText\" class=\"dojoFloatingPaneTitleText\">${this.title}</div>\n\t</div>\n\n\t<div id=\"${this.widgetId}_container\" dojoAttachPoint=\"containerNode\" class=\"dojoFloatingPaneClient\"></div>\n\n\t<div dojoAttachPoint=\"resizeBar\" class=\"dojoFloatingPaneResizebar\" style=\"display:none\"></div>\n</div>\n",
		templateCssString:"\n/********** Outer Window ***************/\n\n.dojoFloatingPane {\n\t/* essential css */\n\tposition: absolute;\n\toverflow: visible;\t\t/* so drop shadow is displayed */\n\tz-index: 10;\n\n\t/* styling css */\n\tborder: 1px solid;\n\tborder-color: ThreeDHighlight ThreeDShadow ThreeDShadow ThreeDHighlight;\n\tbackground-color: ThreeDFace;\n}\n\n\n/********** Title Bar ****************/\n\n.dojoFloatingPaneTitleBar {\n\tvertical-align: top;\n\tmargin: 2px 2px 2px 2px;\n\tz-index: 10;\n\tbackground-color: #7596c6;\n\tcursor: default;\n\toverflow: hidden;\n\tborder-color: ThreeDHighlight ThreeDShadow ThreeDShadow ThreeDHighlight;\n\tvertical-align: middle;\n}\n\n.dojoFloatingPaneTitleText {\n\tfloat: left;\n\tpadding: 2px 4px 2px 2px;\n\twhite-space: nowrap;\n\tcolor: CaptionText;\n\tfont: small-caption;\n}\n\n.dojoTitleBarIcon {\n\tfloat: left;\n\theight: 22px;\n\twidth: 22px;\n\tvertical-align: middle;\n\tmargin-right: 5px;\n\tmargin-left: 5px;\n}\n\n.dojoFloatingPaneActions{\n\tfloat: right;\n\tposition: absolute;\n\tright: 2px;\n\ttop: 2px;\n\tvertical-align: middle;\n}\n\n\n.dojoFloatingPaneActionItem {\n\tvertical-align: middle;\n\tmargin-right: 1px;\n\theight: 22px;\n\twidth: 22px;\n}\n\n\n.dojoFloatingPaneTitleBarIcon {\n\t/* essential css */\n\tfloat: left;\n\n\t/* styling css */\n\tmargin-left: 2px;\n\tmargin-right: 4px;\n\theight: 22px;\n}\n\n/* minimize/maximize icons are specified by CSS only */\n.dojoFloatingPaneMinimizeIcon,\n.dojoFloatingPaneMaximizeIcon,\n.dojoFloatingPaneRestoreIcon,\n.dojoFloatingPaneCloseIcon {\n\tvertical-align: middle;\n\theight: 22px;\n\twidth: 22px;\n\tfloat: right;\n}\n.dojoFloatingPaneMinimizeIcon {\n\tbackground-image: url(images/floatingPaneMinimize.gif);\n}\n.dojoFloatingPaneMaximizeIcon {\n\tbackground-image: url(images/floatingPaneMaximize.gif);\n}\n.dojoFloatingPaneRestoreIcon {\n\tbackground-image: url(images/floatingPaneRestore.gif);\n}\n.dojoFloatingPaneCloseIcon {\n\tbackground-image: url(images/floatingPaneClose.gif);\n}\n\n/* bar at bottom of window that holds resize handle */\n.dojoFloatingPaneResizebar {\n\tz-index: 10;\n\theight: 13px;\n\tbackground-color: ThreeDFace;\n}\n\n/************* Client Area ***************/\n\n.dojoFloatingPaneClient {\n\tposition: relative;\n\tz-index: 10;\n\tborder: 1px solid;\n\tborder-color: ThreeDShadow ThreeDHighlight ThreeDHighlight ThreeDShadow;\n\tmargin: 2px;\n\tbackground-color: ThreeDFace;\n\tpadding: 8px;\n\tfont-family: Verdana, Helvetica, Garamond, sans-serif;\n\tfont-size: 12px;\n\toverflow: auto;\n}\n\n",templateCssPath: dojo.uri.moduleUri("dojo.widget", "templates/FloatingPane.css"),

		fillInFloatingPaneTemplate: function(args, frag){
			// summary: this should be called by fillInTemplate() of the widget that I'm mixed into

			// Copy style info from input node to output node
			var source = this.getFragNodeRef(frag);
			dojo.html.copyStyle(this.domNode, source);

			// necessary for safari, khtml (for computing width/height)
			dojo.body().appendChild(this.domNode);

			// if display:none then state=minimized, otherwise state=normal
			if(!this.isShowing()){
				this.windowState="minimized";
			}

			// <img src=""> can hang IE!  better get rid of it
			if(this.iconSrc==""){
				dojo.html.removeNode(this.titleBarIcon);
			}else{
				this.titleBarIcon.src = this.iconSrc.toString();// dojo.uri.Uri obj req. toString()
			}

			if(this.titleBarDisplay){
				this.titleBar.style.display="";
				dojo.html.disableSelection(this.titleBar);

				this.titleBarIcon.style.display = (this.iconSrc=="" ? "none" : "");

				this.minimizeAction.style.display = (this.displayMinimizeAction ? "" : "none");
				this.maximizeAction.style.display=
					(this.displayMaximizeAction && this.windowState!="maximized" ? "" : "none");
				this.restoreAction.style.display=
					(this.displayMaximizeAction && this.windowState=="maximized" ? "" : "none");
				this.closeAction.style.display= (this.displayCloseAction ? "" : "none");

				this.drag = new dojo.dnd.HtmlDragMoveSource(this.domNode);
				if (this.constrainToContainer) {
					this.drag.constrainTo();
				}
				this.drag.setDragHandle(this.titleBar);

				var self = this;

				dojo.event.topic.subscribe("dragMove",
					function (info){
						if (info.source.domNode == self.domNode){
							dojo.event.topic.publish('floatingPaneMove', { source: self } );
						}
					}
				);
			}

			if(this.resizable){
				this.resizeBar.style.display="";
				// #1184 - set some sensible minimum size constraints on resizehandle
				this.resizeHandle = dojo.widget.createWidget("ResizeHandle", {targetElmId: this.widgetId,
					id:this.widgetId+"_resize",	 minSize: {w: 30, h: 30}});
				this.resizeBar.appendChild(this.resizeHandle.domNode);
			}

			// add a drop shadow
			if(this.hasShadow){
				// #2472 shadow effects depend on having overflow: visible. We need
				// to set it in code due to the way the css cascade works
				this.domNode.style.overflow = 'visible';
				this.shadow=new dojo.lfx.shadow(this.domNode);
			}

			// Prevent IE bleed-through problem
			this.bgIframe = new dojo.html.BackgroundIframe(this.domNode);

			if( this.taskBarId ){
				this._taskBarSetup();
			}

			// counteract body.appendChild above
			dojo.body().removeChild(this.domNode);
		},

		postCreate: function(){
			if (dojo.hostenv.post_load_) {
				this._setInitialWindowState();
			} else {
				dojo.addOnLoad(this, "_setInitialWindowState");
			}
		},

		maximizeWindow: function(/*Event*/ evt) {
			// summary: maximize the window
			var mb = dojo.html.getMarginBox(this.domNode);
			this.previous={
				width: mb.width || this.width,
				height: mb.height || this.height,
				left: this.domNode.style.left,
				top: this.domNode.style.top,
				bottom: this.domNode.style.bottom,
				right: this.domNode.style.right
			};
			if(this.domNode.parentNode.style.overflow.toLowerCase() != 'hidden'){
				this.parentPrevious={
					overflow: this.domNode.parentNode.style.overflow
				};
				dojo.debug(this.domNode.parentNode.style.overflow);
				this.domNode.parentNode.style.overflow = 'hidden';
			}

			this.domNode.style.left =
				dojo.html.getPixelValue(this.domNode.parentNode, "padding-left", true) + "px";
			this.domNode.style.top =
				dojo.html.getPixelValue(this.domNode.parentNode, "padding-top", true) + "px";

			if ((this.domNode.parentNode.nodeName.toLowerCase() == 'body')) {
				var viewport = dojo.html.getViewport();
				var padding = dojo.html.getPadding(dojo.body());
				this.resizeTo(viewport.width-padding.width, viewport.height-padding.height);
			} else {
				var content = dojo.html.getContentBox(this.domNode.parentNode);
				this.resizeTo(content.width, content.height);
			}
			this.maximizeAction.style.display="none";
			this.restoreAction.style.display= this.displayMaximizeAction ? "" : "none";

			//disable resize and drag
			if(this.resizeHandle){
				this.resizeHandle.domNode.style.display="none";
			}
			this.drag.setDragHandle(null);

			this.windowState="maximized";
		},

		minimizeWindow: function(/*Event*/ evt) {
			// summary: hide the window so that only the icon in the taskbar is shown
			this.hide();
			for(var attr in this.parentPrevious){
				this.domNode.parentNode.style[attr] = this.parentPrevious[attr];
			}
			this.lastWindowState = this.windowState;
			this.windowState = "minimized";
		},

		restoreWindow: function(/*Event*/ evt) {
			// summary: set the winow to normal size (neither maximized nor minimized)
			if (this.windowState=="minimized") {
				this.show();
				if(this.lastWindowState == "maximized"){
					this.domNode.parentNode.style.overflow = 'hidden';
					this.windowState="maximized";
				}else{ //normal
					this.windowState="normal";
				}
			} else if (this.windowState=="maximized"){
				for(var attr in this.previous){
					this.domNode.style[attr] = this.previous[attr];
				}
				for(var attr in this.parentPrevious){
					this.domNode.parentNode.style[attr] = this.parentPrevious[attr];
				}
				this.resizeTo(this.previous.width, this.previous.height);
				this.previous=null;
				this.parentPrevious=null;

				this.restoreAction.style.display="none";
				this.maximizeAction.style.display=this.displayMaximizeAction ? "" : "none";

				if(this.resizeHandle){
					this.resizeHandle.domNode.style.display="";
				}
				this.drag.setDragHandle(this.titleBar);
				this.windowState="normal";
			} else { //normal
				// do nothing
			}
		},

		toggleDisplay: function(){
			// summary: switch between hidden mode and displayed mode (either maximized or normal, depending on state before window was minimized)
			if(this.windowState=="minimized"){
				this.restoreWindow();
			}else{
				this.minimizeWindow();
			}
		},

		closeWindow: function(/*Event*/ evt) {
			// summary: destroy this window
			dojo.html.removeNode(this.domNode);
			this.destroy();
		},

		onMouseDown: function(/*Event*/ evt) {
			// summary: callback when user clicks anywhere on the floating pane
			this.bringToTop();
		},

		bringToTop: function() {
			// summary
			//	all the floating panes are stacked in z-index order; bring this floating pane to the top of that stack,
			//	so that it's displayed in front of all the other floating panes
			var floatingPanes= dojo.widget.manager.getWidgetsByType(this.widgetType);
			var windows = [];
			for (var x=0; x<floatingPanes.length; x++) {
				if (this.widgetId != floatingPanes[x].widgetId) {
						windows.push(floatingPanes[x]);
				}
			}

			windows.sort(function(a,b) {
				return a.domNode.style.zIndex - b.domNode.style.zIndex;
			});

			windows.push(this);

			var floatingPaneStartingZ = 100;
			for (x=0; x<windows.length;x++) {
				windows[x].domNode.style.zIndex = floatingPaneStartingZ + x*2;
			}
		},

		_setInitialWindowState: function() {
			if(this.isShowing()){
				this.width=-1;	// force resize
				var mb = dojo.html.getMarginBox(this.domNode);
				this.resizeTo(mb.width, mb.height);
			}
			if (this.windowState == "maximized") {
				this.maximizeWindow();
				this.show();
				return;
			}

			if (this.windowState=="normal") {
				this.show();
				return;
			}

			if (this.windowState=="minimized") {
				this.hide();
				return;
			}

			this.windowState="minimized";
		},

		_taskBarSetup: function() {
			// summary: add icon to task bar, connected to me
			var taskbar = dojo.widget.getWidgetById(this.taskBarId);
			if (!taskbar){
				if (this._taskBarConnectAttempts <  this._max_taskBarConnectAttempts) {
					dojo.lang.setTimeout(this, this._taskBarSetup, 50);
					this._taskBarConnectAttempts++;
				} else {
					dojo.debug("Unable to connect to the taskBar");
				}
				return;
			}
			taskbar.addChild(this);
		},

		showFloatingPane: function(){
			// summary:
			//	bring this floating pane to the top
			this.bringToTop();
		},

		onFloatingPaneShow: function(){
			// summary: callback for when someone calls FloatingPane.show
			var mb = dojo.html.getMarginBox(this.domNode);
			this.resizeTo(mb.width, mb.height);
		},

		// summary: set the floating pane to the given size
		resizeTo: function(/*Integer*/ width, /*Integer*/ height){
			dojo.html.setMarginBox(this.domNode, { width: width, height: height });

			dojo.widget.html.layout(this.domNode,
				[
				  {domNode: this.titleBar, layoutAlign: "top"},
				  {domNode: this.resizeBar, layoutAlign: "bottom"},
				  {domNode: this.containerNode, layoutAlign: "client"}
				] );

			// If any of the children have layoutAlign specified, obey it
			dojo.widget.html.layout(this.containerNode, this.children, "top-bottom");

			this.bgIframe.onResized();
			if(this.shadow){ this.shadow.size(width, height); }
			this.onResized();
		},

		checkSize: function() {
			// summary
			//	checkSize() is called when the user has resized the browser window,
			//  if we are maximized and showing, then we resize to fill the viewport
			// 	otherwise we can safely ignore this call since it that doesn't affect
			//  this widget (or its children)
			if(this.windowState == "maximized" && this.isShowing()){
				// we want to go through the motions of maximizing without the				
				// side-effects. Rather than changing the signature or logic of
				// maximizeWindow, we save our previous remembered locations and parents
				var savedPrevious = this.previous;
				var savedParentPrevious = this.parentPrevious;
				this.maximizeWindow();
				// restore locations and parent 
				this.previous = savedPrevious;
				this.parentPrevious = savedParentPrevious;
			}
		},
		destroyFloatingPane: function() {
			if(this.resizeHandle){
				this.resizeHandle.destroy();
				this.resizeHandle = null;
			}
		}
	}
);

dojo.widget.defineWidget(
	"dojo.widget.FloatingPane",
	[dojo.widget.ContentPane, dojo.widget.FloatingPaneBase],
{
	// summary
	//	A non-modal floating window.
	//	Attaches to a Taskbar which has an icon for each window.
	//	Must specify size (like style="width: 500px; height: 500px;"),

	fillInTemplate: function(args, frag){
		this.fillInFloatingPaneTemplate(args, frag);
		dojo.widget.FloatingPane.superclass.fillInTemplate.call(this, args, frag);
	},
	postCreate: function(){
		dojo.widget.FloatingPaneBase.prototype.postCreate.apply(this, arguments);
		dojo.widget.FloatingPane.superclass.postCreate.apply(this, arguments);
	},
	show: function(){
		dojo.widget.FloatingPane.superclass.show.apply(this, arguments);
		this.showFloatingPane();
	},
	onShow: function(){
		dojo.widget.FloatingPane.superclass.onShow.call(this);
		this.onFloatingPaneShow();
	},
	destroy: function(){
		this.destroyFloatingPane();
		dojo.widget.FloatingPane.superclass.destroy.apply(this, arguments);
	}
});


dojo.widget.defineWidget(
	"dojo.widget.ModalFloatingPane",
	[dojo.widget.FloatingPane, dojo.widget.ModalDialogBase],
	{
		// summary
		//	A modal floating window.
		//	This widget is similar to the Dialog widget, but the window, unlike the Dialog, can be moved.
		//	Must specify size (like style="width: 500px; height: 500px;"),

		windowState: "minimized",
		displayCloseAction: true,
		postCreate: function(){
			this.domNode.style.display="none";
			dojo.widget.ModalFloatingPane.superclass.postCreate.apply(this, arguments);
		},
		show: function(){
			this.showModalDialog();
			dojo.widget.ModalFloatingPane.superclass.show.apply(this, arguments);
			//place the background div under this modal pane
			this.bg.style.zIndex = this.domNode.style.zIndex-1;
		},
		hide: function(){
			this.hideModalDialog();
			dojo.widget.ModalFloatingPane.superclass.hide.apply(this, arguments);
		},
		closeWindow: function(){
			this.hide();
			dojo.widget.ModalFloatingPane.superclass.closeWindow.apply(this, arguments);
		}
	}
);
