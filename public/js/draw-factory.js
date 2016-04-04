mainApp.factory('drawFactory', function ($rootScope) {
  return {
    available_tools:{
    'rectangle':{name:"Rectangle",class:'rectangle'},
    'circle':{name:"Circle",class:"circle"},
    'triangle':{name:"Triangle",class:"triangle"},
    'righttriangle':{name:"Right-angled-Triangle",class:"right_triangle"},
    'freeline':{name:"Free-line",class:"free_line"},
    'straightline':{name:"Straight-line",class:"straight_line"},
    //'eraser':{name:"Eraser",class:"eraser"}
    },
    self:this,
    ctx:null,
    coffsetX:null,
    coffsetY:null,
    path_cords:[],


    tempCords:[],
    addTempCords :function(cords,geo_shape) {
      this.tempCords.push();
    },

    gatherCords:function(e) {
      var mouseX = parseInt(e.x - this.coffsetX);
      var mouseY = parseInt(e.y - this.coffsetY);
      this.path_cords.push(this.point(mouseX,mouseY));
    },
    getCtx : function() { return this.ctx; },
    setCtx : function(ctx) { 

      this.ctx = ctx;

    },
    
    point:function(x,y) { return {x:x,y:y}},
    drag:false,
    setDrag:function(drag) {this.drag = drag;},
    getDrag:function() { return this.drag; },
    geo_shape:"rectangle",
    setGeoShape:function(geo_shape) { 
    this.geo_shape = geo_shape;},
    getGeoShape:function() {return this.geo_shape},
    setDefaultColorWidth:function(self) {
      if (!self) {
        self = this;
      }
      self.setLineWidth(1);

      self.setStrokeColor('black');
    },
    setLastXY:function(x,y) {this.lX = x;this.lY = y},
    getLastXY:function() {return {x:this.lX,y:this.lY}},

    setCurrentXY:function(x,y) {this.cX = x;this.cY = y},
    getCurrentXY:function() {return {x:this.cX,y:this.cY}},
    lineWidth:'2',
    getLineWidth:function() { return this.lineWidth; },
    setLineWidth:function(lineWidth,selfObj) {
      if (!selfObj) {
         selfObj = this;
      }
      selfObj.getCtx().lineWidth = lineWidth;
    },
    
    begin_path:false,

    stroke_color:"blue",
    setStrokeColor: function(color,selfObj) {
      if (!selfObj) {
        selfObj = this;
      }
      var ctx = selfObj.getCtx();
      ctx.strokeStyle = color;
      ctx.fillColor = color;
      selfObj.setCtx(ctx); 
    },
    getStrokeColor: function() {
      return this.stroke_color;
    },
    computeDistance:function(initCord,lastCord) {
      var xDiffSq = (lastCord.x-initCord.x)*(lastCord.x-initCord.x);
      var yDiffSq = (lastCord.y-initCord.y)*(lastCord.y-initCord.y);
      return Math.sqrt(xDiffSq + yDiffSq);
    },
    onDrag:function(event) {
       if (this.getDrag()) {
          this.gatherCords(event);
        }
      if (window.isCurvePath(this.getGeoShape())) {
        eval("this." + this.getGeoShape())(event,this);  
      }
    },
    onStop:function(event) {
       this.setDrag(false);
       this.gatherCords(event);
       eval("this." + this.getGeoShape())(event,this);
       this.ctx.beginPath();
       
    },

    triangle: function(event,self) {
      var lastCord = self.path_cords[self.path_cords.length - 1];
      var initCord = self.path_cords[0];
      var ctx = self.getCtx();
      ctx.beginPath();
      ctx.moveTo(initCord.x,initCord.y);

      var midCord = self.point(initCord.x,lastCord.y);
      
      var delta = self.computeDistance(midCord,lastCord);
      var thirdVertex = self.point(midCord.x - delta,lastCord.y);

      ctx.lineTo(lastCord.x,lastCord.y);
      ctx.lineTo(thirdVertex.x,thirdVertex.y);
      ctx.closePath();
      ctx.stroke();
    },
    righttriangle:function(event,self) {
      var lastCord = self.path_cords[self.path_cords.length - 1];
      var initCord = self.path_cords[0];
      var ctx = self.getCtx();
      ctx.beginPath();
      ctx.moveTo(initCord.x,initCord.y);
      var midCord = self.point(initCord.x,lastCord.y);
      ctx.lineTo(lastCord.x,lastCord.y);
      ctx.lineTo(midCord.x,midCord.y);
      ctx.closePath();
      ctx.stroke();

    },
    freeline:function(event,self) {
      var lastCord = self.path_cords[self.path_cords.length - 1];
      if (self.path_cords.length > 1) {
        var initCord = self.path_cords[self.path_cords.length - 2];
      } else {
        return;
      }
      var ctx = self.getCtx();
      if (!self.getDrag()) {

        ctx.beginPath();
        ctx.moveTo(initCord.x, initCord.y);
      } else {
        ctx.lineTo(lastCord.x, lastCord.y);
      }
      ctx.stroke();

    },
    eraser:function(event,self) {
      var ctx = self.getCtx();
      ctx.strokeStyle = "white";
      ctx.lineWidth = "15";
      self.freeline(event,self);
    },

    straightline:function(event,self) {
      var lastCord = self.path_cords[self.path_cords.length - 1];
      if (self.path_cords.length > 1) {
        var initCord = self.path_cords[0];
      } else {
        return;
      }
      var ctx = self.getCtx();
      if (!self.getDrag()) {

        ctx.beginPath();
        ctx.moveTo(initCord.x, initCord.y);
      
        ctx.lineTo(lastCord.x, lastCord.y);
      }
      ctx.stroke();

    },

    circle:function(event,self) {
        var lastCord = self.path_cords[self.path_cords.length - 1];
        var initCord = self.path_cords[0];
        console.log(self.path_cords);
        var centerX = (lastCord.x+initCord.x)/2;
        var centerY = (lastCord.y + initCord.y)/2;
        var diameter = self.computeDistance(initCord,lastCord);
        var ctx = self.getCtx();
        ctx.beginPath();
        console.log(centerX + "<-- centerX centerY -->" + centerY);
        ctx.arc(centerX,centerY,diameter/2,0,2*Math.PI);
        ctx.stroke();
      },

    rectangle:function(event,self) {

      var lastCord = self.path_cords[self.path_cords.length - 1];
      var initCord = self.path_cords[0];
      var ctx = self.getCtx();
      ctx.beginPath();
      ctx.rect(initCord.x,initCord.y,Math.abs(initCord.x - lastCord.x),Math.abs(initCord.y - lastCord.y));
      ctx.stroke();
    },

    curve:function(event) {
      var xx = this.getPath();
      this.getPath().add(new paper.Point(event.layerX, event.layerY));
      
    },
    draw:function(event){
      this.setDrag(true);
      this.gatherCords(event);
    },
   

    }

});