import React from 'react';
import { Container } from "reactstrap";
import { initCenteringGuidelines } from './Helpers'

class Footer extends React.Component {
    state = {
        savestateaction: true,
        canvasScale: 1,
        SCALE_FACTOR: 1.2,
    };

    componentDidMount() {
        this.initKeyboardEvents();
    }

    undo = () => {
        var canvas = this.props.canvas;
        canvas.stateaction = false;
        var index = canvas.index;
        var state = canvas.state;
        if (index > 0) {
            index -= 1;
            this.removeObjects();
            canvas.loadFromJSON(state[index], function () {
                canvas.renderAll();
                canvas.stateaction = true;
                canvas.index = index;
            });
        }
        else {
            canvas.stateaction = true;
        }
    }

    redo = () => {
        var canvas = this.props.canvas;
        var index = canvas.index;
        var state = canvas.state;
        console.log(index);
        canvas.stateaction = false;
        if (index < state.length - 1) {
            this.removeObjects();
            canvas.loadFromJSON(state[index + 1], function () {
                canvas.renderAll();
                canvas.stateaction = true;
                index += 1;
                canvas.index = index;
            });
        }
        else {
            canvas.stateaction = true;
        }
    }

    removeObjects = () => {
        var canvas = this.props.canvas;
        var activeObject = canvas.getActiveObject();
        if (!activeObject) return;
        if (activeObject.type === 'activeSelection') {
            activeObject.forEachObject((object) => {
                canvas.remove(object);
            });
        }
        else {
            canvas.remove(activeObject);
        }
    }

    zoomIn = () => {
        const canvas = this.props.canvas;

        if (this.state.canvasScale < 4) {
            const percentage = this.state.canvasScale + 0.25;
            this.setCanvasSize(percentage);
            initCenteringGuidelines(canvas);
        }
    }

    // Zoom Out
    zoomOut = () => {
        const canvas = this.props.canvas;
        if (this.state.canvasScale > 0.25) {
            const percentage = this.state.canvasScale - 0.25;
            this.setCanvasSize(percentage);
            initCenteringGuidelines(canvas);
        }
    }

    resetState = () => {
        var canvas = this.props.canvas;
        canvas.state = [];
        canvas.index = 0;
    }

    zoomToPercent = (event) => {
        var percentage = Number(event.target.value) / 100;
        this.setCanvasSize(percentage)
    }

    setCanvasSize = (percentage) => {
        console.log(percentage);
        var canvas = this.props.canvas;

        canvas.setHeight(canvas.getHeight() * (percentage / this.state.canvasScale));
        canvas.setWidth(canvas.getWidth() * (percentage / this.state.canvasScale));
        const objects = canvas.getObjects();

        for (var i in objects) {
            const scaleX = objects[i].scaleX;
            const scaleY = objects[i].scaleY;
            const left = objects[i].left;
            const top = objects[i].top;
            const tempScaleX = scaleX * (percentage / this.state.canvasScale);
            const tempScaleY = scaleY * (percentage / this.state.canvasScale);
            const tempLeft = left * (percentage / this.state.canvasScale);
            const tempTop = top * (percentage / this.state.canvasScale);
            objects[i].scaleX = tempScaleX;
            objects[i].scaleY = tempScaleY;
            objects[i].left = tempLeft;
            objects[i].top = tempTop;
            objects[i].setCoords();
        }
        this.setState({ canvasScale: percentage });
        canvas.renderAll();
    }

    removeObject = () => {
        var canvas = this.props.canvas;
        var activeObject = canvas.getActiveObject();
        if (!activeObject) return;
        if (activeObject.type === 'activeSelection') {
            activeObject.forEachObject(function (object) {
                canvas.remove(object);
            });
        }
        else {
            canvas.remove(activeObject);
        }
    }

    grpungrpItems() {
        var canvas = this.props.canvas;
        var actObj = canvas.getActiveObject();
        if (!actObj) {
            return false;
        }
        if (actObj.type === 'group') {
            actObj.toActiveSelection();
        } else if (actObj.type === 'activeSelection') {
            actObj.toGroup();
        }
        canvas.renderAll();
    }

    initKeyboardEvents = () => {
        let self = this;
        document.onkeyup = function (e) {
            e.preventDefault(); // Let's stop this event.
            e.stopPropagation(); // Really this time.
            if (e.which === 46) {
                self.removeObject();
            }
            if (e.ctrlKey && e.which === 90) {
                self.undo();
            }
            if (e.ctrlKey && e.which === 89) {
                self.redo();
            }
            if (e.which === 71) {
                //group / ungroup items
                self.grpungrpItems();
            }
        };
    }

    render() {
        let options = []
        for (let i = 1; i < 17; i++) {
            options.push(<option key={i} value={i * 25}>{i * 25}%</option>)
        }

        return (
            <Container className="footer">
                <div className="footer-container">
                    {/* <div className="left-view">
                        <div title="Undo" className="btn-action undoicon" onClick={this.undo}>
                            <div className="first">
                                <img className="undo" src={require('../images/undo.png')} alt="" />
                            </div>
                            <div className="second">Undo</div>
                        </div>
                        <div className="divider" />
                        <div title="Redo" className="btn-action redoicon" onClick={this.redo}>
                            <div className="second">Redo</div>
                            <div className="first">
                                <img className="redo" src={require('../images/redo.png')} alt="" />
                            </div>
                        </div>
                    </div> */}
                    <div>
                        {this.props.children}
                    </div>
                    <div className="right-view">
                        <div className="minus" title="Zoom Out" onClick={this.zoomOut}>-</div>
                        <div className="select-container">
                            <span className="select-arrow fa fa-chevron-down"></span>
                            <select className="zoom" onChange={this.zoomToPercent} value={this.state.canvasScale * 100}>
                                {options}
                                <option value="100">FIT</option>
                                <option value="200">FILL</option>
                            </select>
                        </div>
                        <div className="plus" title="Zoom In" onClick={this.zoomIn}>+</div>
                    </div>
                </div>
            </Container>
        );
    }
}

export default Footer;
