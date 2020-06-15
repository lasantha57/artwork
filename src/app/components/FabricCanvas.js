import React, { Component } from 'react';
import { fabric } from 'fabric';
import { saveCanvasState, initCenteringGuidelines, initAligningGuidelines, selectObject } from './Helpers'
import $ from 'jquery';

class FabricCanvas extends Component {
    state = {
        displaybgColorPicker: false,
        subtarget: null
    };

    updateState(e) {
        let stateoptions = {};
        if (e) {
            stateoptions = {
                fontBoldValue: e.target.fontWeight,
                fontItalicValue: e.target.fontStyle,
                fontUnderlineValue: e.target.underline
            }
        }
        this.props.updateState(stateoptions);
    }

    componentDidMount() {
        this.canvas = new fabric.Canvas('main-canvas', {
            preserveObjectStacking: true,
            width: this.props.state.canvaswidth,
            height: this.props.state.canvasheight,
        });
        //for canvas history save - undo / redo
        this.canvas.state = [];
        this.canvas.index = 0;
        this.canvas.stateaction = true;
        initCenteringGuidelines(this.canvas);
        initAligningGuidelines(this.canvas);
        this.initCanvasEvents();
        // remove canvas image
        //this.setcanvasBG(this.props.state.defaultbg);
        //this updates the props also
        this.setState({
            displaybgColorPicker: false
        })
        this.props.updateCanvas(this.canvas);
    }

    initCanvasEvents() {
        var lthis = this;
        $(".canvas-area").click(function () {
            lthis.canvas.discardActiveObject();
            lthis.canvas.renderAll();
        });
        $('.canvas-container').click(function (e) {
            e.stopPropagation();
        });

        fabric.util.addListener(this.canvas.upperCanvasEl, 'dblclick', function (e) {
            if (lthis.state.subtarget) {
                selectObject(lthis.canvas, lthis.state.subtarget);
                lthis.setState({
                    subtarget: null
                })
            }
        });

        this.canvas.on({
            'mouse:down': (e) => {
                if (e.subTargets && e.subTargets[0]) {
                    lthis.setState({
                        subtarget: e.subTargets[0]
                    })
                }
            },
            'object:moving': (e) => {
                lthis.updateState(e);
                if (this.props.state.isOverlap) {
                    lthis.avoidOverlap(e);
                }
                if (this.props.state.isSnap) {
                    e.target.set({
                        left: Math.round(e.target.left / this.props.state.gridsize) * this.props.state.gridsize,
                        top: Math.round(e.target.top / this.props.state.gridsize) * this.props.state.gridsize
                    });
                }
            },
            'object:added': (e) => {
                lthis.updateState(e);
                saveCanvasState(lthis.canvas);
            },
            'object:modified': (e) => {
                lthis.updateState(e);
                saveCanvasState(lthis.canvas);
            },
            'object:selected': (e) => {
                lthis.updateState(e);
            },
            'object:scaling': (e) => {
                lthis.updateState(e);
            },
            'selection:created': (e) => {
                lthis.updateState();
                if (e.subTargets) {
                    selectObject(lthis.canvas, e.subTargets[0]);
                } else
                    selectObject(lthis.canvas);
            },
            'selection:updated': () => {
                lthis.updateState();
                selectObject(lthis.canvas);
            },
            'selection:cleared': () => {
                lthis.updateState();
            },
            'selection:added': (e) => { },
        });
    }

    avoidOverlap = (e) => {
        var snap = 20;
        var lthis = this;
        // Sets corner position coordinates based on current angle, width and height
        e.target.setCoords();
        // Don't allow objects off the canvas
        if (e.target.get('left') < snap) {
            e.target.set({
                left: 0
            });
        }
        if (e.target.get('top') < snap) {
            e.target.set({
                top: 0
            });
        }
        if ((e.target.get('width') + e.target.get('left')) > (this.canvasWidth - snap)) {
            e.target.set({
                left: this.canvasWidth - e.target.get('width')
            });
        }
        if ((e.target.get('height') + e.target.get('top')) > (this.canvasHeight - snap)) {
            e.target.set({
                top: this.canvasHeight - e.target.get('height')
            });
        }

        this.canvas.forEachObject(function (obj) {
            if (obj === e.target) return;
            // If objects intersect
            if (e.target.isContainedWithinObject(obj) || e.target.intersectsWithObject(obj) || obj.isContainedWithinObject(e.target)) {
                var distX = ((obj.get('left') + obj.get('width')) / 2) - ((e.target.get('left') + e.target.get('width')) / 2);
                var distY = ((obj.get('top') + obj.get('height')) / 2) - ((e.target.get('top') + e.target.get('height')) / 2);
                // Set new position
                lthis.findNewPos(distX, distY, e.target, obj);
            }
            // Snap objects to each other horizontally
            // If bottom points are on same Y axis
            if (Math.abs((e.target.get('top') + e.target.get('height')) - (obj.get('top') + obj.get('height'))) < snap) {
                // Snap target BL to object BR
                if (Math.abs(e.target.get('left') - (obj.get('left') + obj.get('width'))) < snap) {
                    e.target.set({
                        left: obj.get('left') + obj.get('width')
                    });
                    e.target.set({
                        top: obj.get('left') + obj.get('width')
                    });
                }
                // Snap target BR to object BL
                if (Math.abs((e.target.get('left') + e.target.get('width')) - obj.get('left')) < snap) {
                    e.target.set({
                        left: obj.get('left') - e.target.get('width')
                    });
                    e.target.set({
                        top: obj.get('top') + obj.get('height') - e.target.get('height')
                    });
                }
            }
            // If top points are on same Y axis
            if (Math.abs(e.target.get('top') - obj.get('top')) < snap) {
                // Snap target TL to object TR
                if (Math.abs(e.target.get('left') - (obj.get('left') + obj.get('width'))) < snap) {
                    e.target.set({
                        left: obj.get('left') + obj.get('width')
                    });
                    e.target.set({
                        top: obj.get('top')
                    });
                }
                // Snap target TR to object TL
                if (Math.abs((e.target.get('left') + e.target.get('width')) - obj.get('left')) < snap) {
                    e.target.set({
                        left: obj.get('left') + obj.get('width')
                    });
                    e.target.set({
                        top: obj.get('top')
                    });
                }
            }
            // Snap objects to each other vertically
            // If right points are on same X axis
            if (Math.abs((e.target.get('left') + e.target.get('width')) - (obj.get('left') + obj.get('width'))) < snap) {
                // Snap target TR to object BR
                if (Math.abs(e.target.get('top') - (obj.get('top') + obj.get('height'))) < snap) {
                    e.target.set({
                        left: obj.get('left') + obj.get('width') - e.target.get('width')
                    });
                    e.target.set({
                        top: obj.get('top') + obj.get('height')
                    });
                }
                // Snap target BR to object TR
                if (Math.abs((e.target.get('top') + e.target.get('height')) - obj.get('top')) < snap) {
                    e.target.set({
                        left: obj.get('left') + obj.get('width') - e.target.get('width')
                    });
                    e.target.set({
                        top: obj.get('top') - e.target.get('height')
                    });
                }
            }
            // If left points are on same X axis
            if (Math.abs(e.target.get('left') - obj.get('left')) < snap) {
                // Snap target TL to object BL
                if (Math.abs(e.target.get('top') - (obj.get('top') + obj.get('height'))) < snap) {
                    e.target.set({
                        left: obj.get('left')
                    });
                    e.target.set({
                        top: obj.get('top') + obj.get('height')
                    });
                }
                // Snap target BL to object TL
                if (Math.abs((e.target.get('top') + e.target.get('height')) - obj.get('top')) < snap) {
                    e.target.set({
                        left: obj.get('left')
                    });
                    e.target.set({
                        top: obj.get('top') + obj.get('height')
                    });
                }
            }
        });
    }

    findNewPos = (distX, distY, target, obj) => {
        // See whether to focus on X or Y axis
        if (Math.abs(distX) > Math.abs(distY)) {
            if (distX > 0) {
                target.set({
                    left: obj.get('left') - target.get('width')
                });
            } else {
                target.set({
                    left: obj.get('left') + obj.get('width')
                });
            }
        } else {
            if (distY > 0) {
                target.set({
                    top: obj.get('top') - target.get('height')
                });
            } else {
                target.set({
                    top: obj.get('top') + obj.get('height')
                });
            }
        }
    }

    deleteCanvasBg = () => {
        this.canvas.backgroundColor = '';
        this.canvas.renderAll();
        var objects = this.canvas.getObjects().filter(function (o) {
            return o.bg === true;
        });
        for (var i = 0; i < objects.length; i++) {
            this.canvas.remove(objects[i]);
        }
        this.canvas.bgsrc = "";
        this.canvas.bgcolor = "";
    }

    setcanvasBG = (result) => {
        var bgsrc = result;
        if (result && result.url) bgsrc = result.url;
        if (bgsrc) {
            this.deleteCanvasBg();
            fabric.Image.fromURL(bgsrc, (bg) => {
                var canvasAspect = this.canvas.width / this.canvas.height;
                var imgAspect = bg.width / bg.height;
                var scaleFactor;
                if (canvasAspect >= imgAspect) {
                    scaleFactor = this.canvas.width / bg.width * 1;
                } else {
                    scaleFactor = this.canvas.height / bg.height * 1;
                }
                bg.set({
                    originX: 'center',
                    originY: 'center',
                    opacity: 1,
                    selectable: false,
                    hasBorders: false,
                    hasControls: false,
                    hasCorners: false,
                    left: this.canvas.width / 2,
                    top: this.canvas.height / 2,
                    scaleX: scaleFactor,
                    scaleY: scaleFactor,
                    strokeWidth: 0
                });
                this.canvas.add(bg);
                this.canvas.sendToBack(bg);
                bg.bg = true;
                this.canvas.bgsrc = bgsrc;
            });
        }
    }

    bgpickerOpen = () => {
        this.setState({
            displaybgColorPicker: !this.state.displaybgColorPicker
        })
    };

    bgpickerClose = () => {
        this.setState({
            displaybgColorPicker: false
        })
    };

    render() {
        return (
            <div className="main-area">
                <div className="canvas-area">
                    <canvas id='main-canvas'>
                    </canvas>
                </div>
            </div>
        );
    }
}

export default FabricCanvas;
