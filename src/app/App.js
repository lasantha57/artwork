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
            canvaswidth: 780,
            canvasheight: 440,
            //defaultbg: require('./images/main-img.jpg'),
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

    export = () => {
        let currentTime = new Date();
        let month = currentTime.getMonth() + 1;
        let day = currentTime.getDate();
        let year = currentTime.getFullYear();
        let hours = currentTime.getHours();
        let minutes = currentTime.getMinutes();
        let seconds = currentTime.getSeconds();
        let fileName = month + '' + day + '' + year + '' + hours + '' + minutes + '' + seconds;
        const canvasdata = document.getElementById('main-canvas');
        const canvasDataUrl = canvasdata.toDataURL().replace(/^data:image\/[^;]*/, 'data:application/octet-stream'),
            link = document.createElement('a');
        fileName = fileName + ".png";
        link.setAttribute('href', canvasDataUrl);
        link.setAttribute('crossOrigin', 'anonymous');
        link.setAttribute('target', '_blank');
        link.setAttribute('download', fileName);
        if (document.createEvent) {
            let evtObj = document.createEvent('MouseEvents');
            evtObj.initEvent('click', true, true);
            link.dispatchEvent(evtObj);
        } else if (link.click) {
            link.click();
        }
    }

    downloadAsJSON = () => {
        let currentTime = new Date();
        let month = currentTime.getMonth() + 1;
        let day = currentTime.getDate();
        let year = currentTime.getFullYear();
        let hours = currentTime.getHours();
        let minutes = currentTime.getMinutes();
        let seconds = currentTime.getSeconds();
        let fileName = month + '' + day + '' + year + '' + hours + '' + minutes + '' + seconds;
        let canvasdata = this.state.canvas.toDatalessJSON();
        let string = JSON.stringify(canvasdata);
        let file = new Blob([string], {
            type: 'application/json'
        });
        let a = document.createElement('a');
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
        let offstate = document.querySelectorAll('#snapswitch');
        for (let j = 0; j < offstate.length; j++) {
            offstate[j].checked = this.state.isSnap;
        }
    }

    showhideGrid = () => {
        let isGrid = !this.state.isGrid;
        this.setState({
            isGrid: isGrid,
        });
        if (isGrid) {
            for (let i = 0; i < (650 / this.state.gridsize); i++) {
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
        let offstate = document.querySelectorAll('#gridswitch');
        for (let j = 0; j < offstate.length; j++) {
            offstate[j].checked = this.state.isGrid;
        }
        this.state.canvas.renderAll();
    }

    clearGrid = () => {
        let objects = this.state.canvas.getObjects('line');
        for (let i in objects) {
            this.state.canvas.remove(objects[i]);
        }
    }

    setOverlap = () => {
        this.setState({
            isOverlap: !this.state.isOverlap,
        });
        let offoverlap = document.querySelectorAll('#overlapswitch');
        for (let j = 0; j < offoverlap.length; j++) {
            offoverlap[j].checked = this.state.isOverlap;
        }
    }

    render() {
        const { sidebarWidth, collapse } = this.state;

        return (
            <Container fluid>
                <Row className="navbar-container">
                    <Col>
                        <nav className="navbar navbar-expand-lg header-bar">
                            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="{null}bs-example-navbar-collapse-1">
                                <span className="navbar-toggler-icon"></span>
                            </button>
                            <a className="navbar-brand" href="/"><img src={require('./images/logo.svg')} alt="" /> <small>Artwork Editor</small></a>
                            {/* <div className="left-link"><span className="nav-link brand text-primary"><strong>Otter Artwork Editor</strong></span></div> */}
                        </nav>
                    </Col>
                    <Col>
                        <nav className="navbar navbar-expand-lg header-bar">
                            <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                                <ul className="navbar-nav ml-md-auto">
                                    {/* <li className="nav-item active download">
                                        <span className="btn btn-outline" onClick={this.downloadAsJSON}>Export JSON</span>
                                    </li> */}
                                    <li className="nav-item active download">
                                        <span className="btn btn-success" onClick={this.export}>Export</span>
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
                                        <i className="fas fa-font fa-2x text-muted"></i>
                                        <span>TEXT</span>
                                    </div>
                                </Tab>
                                <Tab tabFor="vertical-tab-two" className="lasttab" onClick={() => this.toggleSidebar(true)}>
                                    <div className="edit-box">
                                        <i className="fas fa-border-all fa-2x text-muted"></i>
                                        <span>BKGROUND</span>
                                    </div>
                                </Tab>
                                <Tab tabFor="vertical-tab-one" className="lasttab" onClick={() => this.toggleSidebar(false)}>
                                    <div className="edit-box">
                                        <i className="fas fa-images fa-2x text-muted"></i>
                                        <span>PHOTOS</span>
                                    </div>
                                </Tab>
                                <Tab tabFor="vertical-tab-one" className="lasttab" onClick={() => this.toggleSidebar(false)}>
                                    <div className="edit-box">
                                        <i className="fas fa-shapes fa-2x text-muted"></i>
                                        <span>ELEMENTS</span>
                                    </div>
                                </Tab>
                            </TabList>
                            <div style={{ width: sidebarWidth }} className="left-side-panel">
                                {collapse && (
                                    <LeftPanel canvas={this.state.canvas} />
                                )}
                            </div>
                            <div className="btn-toggle"
                                onClick={() => this.toggleSidebar(!this.state.collapse)}
                                style={{ opacity: collapse ? 1 : 0 }}>
                                <i className="fas fa-chevron-left arrowimage"></i>
                            </div>
                        </Tabs>
                    </div>

                    <div className="canvas-panel">
                        <Toolbar state={this.state} updateCanvas={this.updateCanvas} />

                        <FabricCanvas state={this.state} updateCanvas={this.updateCanvas} updateState={this.updateState} />

                        <Footer canvas={this.state.canvas}>
                            <ul className="navbar-nav ml-md-auto">
                                {/* <li className="nav-item">
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
                                </li> */}
                            </ul>
                        </Footer>
                    </div>
                </Row>
            </Container>
        );
    }
}

export default App;
