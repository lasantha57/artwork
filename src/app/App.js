// File Imports
import React, { Component } from 'react';
import { fabric } from 'fabric';
import { Row, Col, Container } from "reactstrap";
import { Tabs, Tab, TabList } from 'react-web-tabs';

import FabricCanvas from './components/FabricCanvas';
import Toolbar from './components/Toolbar';
import LeftPanel from './components/LeftPanel';
import Footer from './components/Footer';

import './App.scss';
import './Styles/Navbar.scss'
import './Styles/TabView.scss'
import './Styles/LeftSidePanel.scss'
import './Styles/Footer.scss'
import './Styles/FabricCanvas.scss'
import './Styles/Toolbar.scss'

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            canvas: null,
            isSnap: false,
            isOverlap: false,
            isGrid: false,
            sidebarWidth: 367,
            canvaswidth: 640,
            canvasheight: 360,
            defaultbg: require('./images/main-img.jpg'),
            fontBoldValue: 'normal',
            fontItalicValue: '',
            fontUnderlineValue: '',
            collapse: true,
            gridsize: 30
        };
    }

    updateCanvas = (canvas) => {
        this.setState({
            canvas: canvas
        });
    }

    updateState = (stateoptions) => {
        this.setState(stateoptions);
    }

    toggleSidebar = (type) => {
        this.setState({ collapse: type });

        this.setState({
            sidebarWidth: type ? 367 : 0
        });
    }

    downloadAsPNG = () => {
        var currentTime = new Date();
        var month = currentTime.getMonth() + 1;
        var day = currentTime.getDate();
        var year = currentTime.getFullYear();
        var hours = currentTime.getHours();
        var minutes = currentTime.getMinutes();
        var seconds = currentTime.getSeconds();
        var fileName = month + '' + day + '' + year + '' + hours + '' + minutes + '' + seconds;
        const canvasdata = document.getElementById('main-canvas');
        const canvasDataUrl = canvasdata.toDataURL().replace(/^data:image\/[^;]*/, 'data:application/octet-stream'),
            link = document.createElement('a');
        fileName = fileName + ".png";
        link.setAttribute('href', canvasDataUrl);
        link.setAttribute('crossOrigin', 'anonymous');
        link.setAttribute('target', '_blank');
        link.setAttribute('download', fileName);
        if (document.createEvent) {
            var evtObj = document.createEvent('MouseEvents');
            evtObj.initEvent('click', true, true);
            link.dispatchEvent(evtObj);
        } else if (link.click) {
            link.click();
        }
    }

    downloadAsJSON = () => {
        var currentTime = new Date();
        var month = currentTime.getMonth() + 1;
        var day = currentTime.getDate();
        var year = currentTime.getFullYear();
        var hours = currentTime.getHours();
        var minutes = currentTime.getMinutes();
        var seconds = currentTime.getSeconds();
        var fileName = month + '' + day + '' + year + '' + hours + '' + minutes + '' + seconds;
        var canvasdata = this.state.canvas.toDatalessJSON();
        var string = JSON.stringify(canvasdata);
        var file = new Blob([string], {
            type: 'application/json'
        });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    setSnap = () => {
        this.setState({
            isSnap: !this.state.isSnap,
        });
        var offstate = document.querySelectorAll('#snapswitch');
        for (var j = 0; j < offstate.length; j++) {
            offstate[j].checked = this.state.isSnap;
        }
    }

    showhideGrid = () => {
        var isGrid = !this.state.isGrid;
        this.setState({
            isGrid: isGrid,
        });
        if (isGrid) {
            for (var i = 0; i < (650 / this.state.gridsize); i++) {
                this.state.canvas.add(new fabric.Line([i * this.state.gridsize, 0, i * this.state.gridsize, 650], {
                    stroke: '#ccc',
                    selectable: false
                }));
                this.state.canvas.add(new fabric.Line([0, i * this.state.gridsize, 650, i * this.state.gridsize], {
                    stroke: '#ccc',
                    selectable: false
                }))
            }
        } else {
            this.clearGrid();
        }
        var offstate = document.querySelectorAll('#gridswitch');
        for (var j = 0; j < offstate.length; j++) {
            offstate[j].checked = this.state.isGrid;
        }
        this.state.canvas.renderAll();
    }

    clearGrid = () => {
        var objects = this.state.canvas.getObjects('line');
        for (let i in objects) {
            this.state.canvas.remove(objects[i]);
        }
    }

    setOverlap = () => {
        this.setState({
            isOverlap: !this.state.isOverlap,
        });
        var offoverlap = document.querySelectorAll('#overlapswitch');
        for (var j = 0; j < offoverlap.length; j++) {
            offoverlap[j].checked = this.state.isOverlap;
        }
    }

    render() {
        const { sidebarWidth, collapse } = this.state;

        return (
            <Container>
                <Row className="navbar-container">
                    <Col>
                        <nav className="navbar navbar-expand-lg header-bar">
                            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="{null}bs-example-navbar-collapse-1">
                                <span className="navbar-toggler-icon"></span>
                            </button>
                            <a className="navbar-brand" href="/"><img src={require('./images/logo.jpg')} alt="" /></a>
                            <div className="left-link"><span className="nav-link brand">Artwork Editor</span></div>
                        </nav>
                    </Col>
                    <Col>
                        <nav className="navbar navbar-expand-lg header-bar">
                            <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                                <ul className="navbar-nav ml-md-auto">
                                    <li className="nav-item active download">
                                        <span className="btn btn-outline" onClick={this.downloadAsJSON}>Export JSON</span>
                                    </li>
                                    <li className="nav-item active download">
                                        <span className="btn btn-fill" onClick={this.downloadAsPNG}>Export Artwork</span>
                                    </li>
                                    <li className="nav-item">
                                        <span className="nav-link btn-close" href="/"><img src={require('./images/close.jpg')} alt="" /></span>
                                    </li>
                                </ul>
                            </div>
                        </nav>
                    </Col>
                </Row>

                <Row className="main-container">
                    <div className="tabpanel">
                        <Tabs defaultTab="vertical-tab-one" vertical className="vertical-tabs">
                            <TabList>
                                <Tab tabFor="vertical-tab-one" className="lasttab" onClick={() => this.toggleSidebar(true)}>
                                    <div className="edit-box">
                                        <img src={require('./images/textbg.jpg')} alt="" />
                                        <span>TEXT</span>
                                    </div>
                                </Tab>
                                <Tab tabFor="vertical-tab-two" className="lasttab" onClick={() => this.toggleSidebar(true)}>
                                    <div className="edit-box">
                                        <img src={require('./images/bg.jpg')} alt="" />
                                        <span>BKGROUND</span>
                                    </div>
                                </Tab>
                                <Tab tabFor="vertical-tab-three" className="lasttab" onClick={() => this.toggleSidebar(true)}>
                                    <div className="edit-box">
                                        <img src={require('./images/bg.jpg')} alt="" />
                                        <span>PHOTOS</span>
                                    </div>
                                </Tab>
                                <Tab tabFor="vertical-tab-four" className="lasttab" onClick={() => this.toggleSidebar(true)}>
                                    <div className="edit-box">
                                        <img src={require('./images/bg.jpg')} alt="" />
                                        <span>ELEMENTS</span>
                                    </div>
                                </Tab>
                            </TabList>
                            <div style={{ width: sidebarWidth }} className="left-side-panel">
                                {collapse && (
                                    <LeftPanel canvas={this.state.canvas} />
                                )}
                            </div>
                            <div
                                className="btn-toggle"
                                onClick={() => this.toggleSidebar(false)}
                                style={{ opacity: collapse ? 1 : 0 }}
                            >
                                <img className="arrowimage" src={require('./images/left.png')} alt="" />
                            </div>
                        </Tabs>
                    </div>

                    <div className="canvas-panel">
                        <Toolbar state={this.state} updateCanvas={this.updateCanvas} />

                        <FabricCanvas state={this.state} updateCanvas={this.updateCanvas} updateState={this.updateState} />

                        <Footer canvas={this.state.canvas}>
                            <ul className="navbar-nav ml-md-auto">
                                <li className="nav-item">
                                    <a className="nav-link switch" href="{null}" title="Display Grid">Grid <input type="checkbox" id="gridswitch" />
                                        <label htmlFor="gridswitch" onClick={this.showhideGrid}>Toggle</label>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link switch" href="{null}" title="Snap to Grid">Snap <input type="checkbox" id="snapswitch" />
                                        <label htmlFor="snapswitch" onClick={this.setSnap}>Toggle</label>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link switch" href="{null}" title="Overlap">Overlap <input type="checkbox" id="overlapswitch" />
                                        <label htmlFor="overlapswitch" onClick={this.setOverlap}>Toggle</label>
                                    </a>
                                </li>
                            </ul>
                        </Footer>
                    </div>
                </Row>
            </Container>
        );
    }
}

export default App;
