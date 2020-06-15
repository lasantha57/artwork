import React, { Component } from 'react';
import { fabric } from 'fabric';
import { SketchPicker } from 'react-color';
import { Row, Col, Container, Form, Input } from "reactstrap";
import { TabPanel } from 'react-web-tabs';
import { client } from 'filestack-react';
import Popup from 'reactjs-popup';
import { unique, saveCanvasState, selectObject } from './Helpers';

import { TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap';
import classnames from 'classnames';

const INIT_SOLID_COLORS = [
    '#d0021b',
    '#f5a623',
    '#f8e71c',
    '#8b572a',
    '#b8e986',
    '#417505',
    '#4a90e2',
    '#50e3ca',
    '#000000',
    '#ffffff'
]

// const INIT_PATTERN_IMAGES = [
//     require('../images/img/pattern1.jpg'),
//     require('../images/img/pattern2.jpg'),
//     require('../images/img/pattern3.jpg'),
//     require('../images/img/pattern4.jpg'),
//     require('../images/img/pattern5.jpg'),
//     require('../images/img/pattern6.jpg'),
//     require('../images/img/pattern7.jpg'),
//     require('../images/img/pattern8.jpg'),
//     require('../images/img/pattern9.jpg')
// ]

const INIT_ELEMENT_ICONS = [
    require('../images/elements/circle.svg'),
    require('../images/elements/rectangle.svg'),
    require('../images/elements/square.svg'),
    require('../images/elements/triangle.svg'),
    // require('../images/elements/ellipse.svg')
]

// const INIT_ELEMENT_SHAPES = [
//     require('../images/elements/Party_1233.svg'),
//     require('../images/elements/Party_1239.svg'),
//     require('../images/elements/Party_1241.svg'),
//     require('../images/elements/Party_1242.svg'),
//     require('../images/elements/Party_1245.svg'),
//     require('../images/elements/Party_1246.svg')
// ]

// const INIT_ELEMENT_CLIPARTS = [
//     require('../images/elements/logo_1214.svg'),
//     require('../images/elements/logo_1215.svg'),
//     require('../images/elements/logo_1216.svg'),
//     require('../images/elements/logo_1219.svg'),
//     require('../images/elements/logo_1232.svg'),
//     require('../images/elements/logo_1234.svg')
// ]

// const INIT_ELEMENT_ELEMENTS = [
//     require('../images/elements/closet.svg'),
//     require('../images/elements/confetti.svg'),
//     require('../images/elements/Email.svg'),
//     require('../images/elements/facebook.svg'),
//     require('../images/elements/gift.svg'),
//     require('../images/elements/hat.svg'),
//     require('../images/elements/fireplace.svg'),
//     require('../images/elements/instagram.svg'),
//     require('../images/elements/dryer.svg')
// ]

class LeftPanel extends Component {
    state = {
        displaybgColorPicker: false,
        displaygrad1ColorPicker: false,
        displaygrad2ColorPicker: false,
        canvasScale: 1,
        SCALE_FACTOR: 1.2,
        bgcolArray: [],
        backgroundcolor: '',
        grad1color: 'black',
        grad2color: 'black',
        apiImg: [],
        page: 1,
        searchkey: 'sport',
        activeTab: '1',
        imgactiveTab: '1',
        unsplashImg: [],
        unsplashsearchkey: 'woods',
        client_id: "10c09efaf736d64b6c6f38d93620399aca995d73f0379c86995521375dff759d",
        pagenum: 1
    };

    constructor(props) {
        super(props);
        this.iScrollRef = React.createRef();
        this.imgScrollRef = React.createRef();
    }

    componentDidMount() {
        let bgcolArray = localStorage.getItem("bgcolors");
        if (bgcolArray) {
            bgcolArray = JSON.parse(bgcolArray);
            this.setState({
                bgcolArray: bgcolArray
            });
        }

        this.pixaybay();
        this.unsplash();

        this.iScrollRef.current.addEventListener("scroll", () => {
            if (
                this.iScrollRef.scrollTop + this.iScrollRef.clientHeight >=
                this.iScrollRef.scrollHeight
            ) {
                this.incerment();
            }
        });
        this.imgScrollRef.current.addEventListener("scroll", () => {
            if (
                this.imgScrollRef.scrollTop + this.imgScrollRef.clientHeight >=
                this.imgScrollRef.scrollHeight
            ) {
                this.incermentpage();
            }
        });

        // REMOVE ME:
        setTimeout(() => {
            this.setBGcolor('#ffffff');
        }, 100);

    }

    addShape = () => {
        var canvas = this.props.canvas;
        const circle = new fabric.Circle({
            radius: 50,
            left: 10,
            top: 10,
            strokeWidth: '',
            stroke: '',
            fill: '#ff5722'
        });
        canvas.add(circle);
        canvas.setActiveObject(circle);
        selectObject(canvas);
        canvas.renderAll();
    }

    addHeadingtxt = () => {
        var canvas = this.props.canvas;
        var text = new fabric.Textbox('Add Heading', {
            fontFamily: 'Montserrat',
            left: 100,
            top: 100,
            type: 'text',
            fontSize: 36,
            width: 250,
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        selectObject(canvas);
        canvas.renderAll();
    }

    addSubheadingtxt = () => {
        var canvas = this.props.canvas;
        var text = new fabric.Textbox('Add Subheading', {
            fontFamily: 'Montserrat',
            left: 100,
            top: 100,
            type: 'text',
            fontSize: 24,
            width: 200,
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        selectObject(canvas);
        canvas.renderAll();
    }

    addText = () => {
        var canvas = this.props.canvas;
        var text = new fabric.Textbox('Add text', {
            fontFamily: 'Montserrat',
            left: 100,
            top: 100,
            type: 'text',
            fontSize: 18,
            width: 200,
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        selectObject(canvas);
        canvas.renderAll();
    }

    deleteCanvasBg = () => {
        var canvas = this.props.canvas;
        canvas.backgroundColor = '';
        canvas.renderAll();
        //if (!lcanvas) lcanvas = canvas;
        var objects = canvas.getObjects().filter(function (o) {
            return o.bg === true;
        });
        for (var i = 0; i < objects.length; i++) {
            canvas.remove(objects[i]);
        }
        canvas.bgsrc = "";
        canvas.bgcolor = "";
    }

    setCanvasFill = (bgcolor) => {
        var canvas = this.props.canvas;
        this.deleteCanvasBg();
        canvas.backgroundColor = bgcolor.hex;
        canvas.renderAll();
        this.setState({
            backgroundColor: bgcolor.hex
        });
        saveCanvasState(canvas);
    }

    dynamicBGcolors = (bgcol) => {
        var bgcolArray = this.state.bgcolArray;
        bgcolArray.push(bgcol);
        bgcolArray = unique(bgcolArray);
        console.log(bgcolArray);
        this.setState({
            bgcolArray: bgcolArray
        });
        this.setState({
            backgroundcolor: bgcol
        });
        localStorage.setItem('bgcolors', JSON.stringify(bgcolArray));
    }

    showUploadPopup = () => {
        const options = {
            accept: 'image/*',
            //fromSources: ['local_file_system'],
            maxSize: 1024 * 1024,
            maxFiles: 1,
            onFileUploadFinished: this.setcanvasBG
        }
        const filestack = client.init('A3wr3EiC8RUKJhe0FwIGfz', options);
        const picker = filestack.picker(options);
        picker.open();
    }

    uploadIcon = () => {
        const options = {
            accept: 'image/svg+xml',
            //fromSources: ['local_file_system'],
            maxSize: 1024 * 1024,
            maxFiles: 1,
            onFileUploadFinished: this.addSVG
        }
        const filestack = client.init('A3wr3EiC8RUKJhe0FwIGfz', options);
        const picker = filestack.picker(options);
        picker.open();
    }

    handleUploadError = (e) => {
        console.log(e);
    }

    addSVG = (result) => {
        var canvas = this.props.canvas;
        var svg = result;
        fabric.loadSVGFromURL(svg, (objects) => {
            var loadedObject = fabric.util.groupSVGElements(objects);
            loadedObject.set({
                scaleX: 1,
                scaleY: 1,
                opacity: 1,
                subTargetCheck: true
            });
            loadedObject.src = svg;
            canvas.add(loadedObject);
            canvas.setActiveObject(loadedObject);
            loadedObject.scaleToWidth(150);
            loadedObject.hasRotatingPoint = true;
            saveCanvasState(canvas);
            selectObject(canvas);
            canvas.renderAll();
        });
    }

    setcanvasBG = (result) => {
        var canvas = this.props.canvas;
        var bgsrc = result;
        if (result && result.url) bgsrc = result.url;
        if (bgsrc) {
            this.deleteCanvasBg();
            fabric.Image.fromURL(bgsrc, (bg) => {
                var canvasAspect = canvas.width / canvas.height;
                var imgAspect = bg.width / bg.height;
                var scaleFactor;
                if (canvasAspect >= imgAspect) {
                    scaleFactor = canvas.width / bg.width * 1;
                }
                else {
                    scaleFactor = canvas.height / bg.height * 1;
                }
                bg.set({
                    originX: 'center',
                    originY: 'center',
                    opacity: 1,
                    selectable: false,
                    hasBorders: false,
                    hasControls: false,
                    hasCorners: false,
                    left: canvas.width / 2,
                    top: canvas.height / 2,
                    scaleX: scaleFactor,
                    scaleY: scaleFactor,
                    strokeWidth: 0
                });
                canvas.add(bg);
                canvas.sendToBack(bg);
                bg.bg = true;
                canvas.bgsrc = bgsrc;
                saveCanvasState(canvas);
            });
        }
    }

    grad1colorOpen = () => {
        this.setState({
            displaygrad1ColorPicker: !this.state.displaygrad1ColorPicker
        })
    };

    grad1colorClose = () => {
        this.setState({
            displaygrad1ColorPicker: false
        })
        this.dynamicBGcolors(this.state.backgroundColor);
        this.setGradientBGcolor(this.state.grad1color, this.state.grad2color, 'vertical');
    };

    grad2colorOpen = () => {
        this.setState({
            displaygrad2ColorPicker: !this.state.displaygrad2ColorPicker
        })
    };

    grad2colorClose = () => {
        this.setState({
            displaygrad2ColorPicker: false
        })
        this.setGradientBGcolor(this.state.grad1color, this.state.grad2color, 'vertical');
    };

    bgcolorOpen = () => {
        this.setState({
            displaybgColorPicker: !this.state.displaybgColorPicker
        })
    };

    bgcolorClose = () => {
        this.setState({
            displaybgColorPicker: false
        })
        this.dynamicBGcolors(this.state.backgroundColor);
    };

    setVerticalgradient = (color) => {
        this.setGradientBGcolor(this.state.grad1color, this.state.grad2color, 'vertical');
    }

    setRadialgradient = (color) => {
        this.setGradientBGcolor(this.state.grad1color, this.state.grad2color, 'radial');
    }

    setGradient1BGcolor = (color) => {
        this.setState({
            grad1color: color.hex
        });
    }

    setGradient2BGcolor = (color) => {
        this.setState({
            grad2color: color.hex
        });
    }

    setGradientBGcolor = (colone, coltwo, type) => {
        if (!colone || !coltwo) return;
        this.deleteCanvasBg();
        var canvas = this.props.canvas;
        if (type === 'vertical') {
            var verticalgrad = new fabric.Gradient({
                type: 'linear',
                coords: {
                    x1: 0,
                    y1: canvas.height / 4,
                    x2: 0,
                    y2: canvas.height / 2 + canvas.height / 4,
                },
                colorStops: [{
                    color: colone,
                    offset: 0,
                }, {
                    color: coltwo,
                    offset: 1,
                }]
            });
            canvas.backgroundColor = verticalgrad;
            canvas.renderAll();
        }
        if (type === 'radial') {
            var radialgrad = new fabric.Gradient({
                type: 'radial',
                coords: {
                    r1: canvas.width / 2,
                    r2: canvas.width / 4,
                    x1: (canvas.width / 2) - 1,
                    y1: (canvas.height / 2) - 1,
                    x2: canvas.width / 2,
                    y2: canvas.height / 2,
                },
                colorStops: [{
                    color: colone,
                    offset: 0,
                }, {
                    color: coltwo,
                    offset: 1,
                }]
            });
            canvas.backgroundColor = radialgrad;
            canvas.renderAll();
        }
        if (type === 'horizontal') {
            var horizontalgrad = new fabric.Gradient({
                type: 'linear',
                coords: {
                    x1: canvas.width / 4,
                    y1: 0,
                    x2: canvas.width / 2 + canvas.width / 4,
                    y2: 0,
                },
                colorStops: [{
                    color: colone,
                    offset: 0,
                }, {
                    color: coltwo,
                    offset: 1,
                }]
            });
            canvas.backgroundColor = horizontalgrad;
            canvas.renderAll();
        }
        saveCanvasState(canvas);
    }

    setBGcolor = (color) => {
        this.deleteCanvasBg();
        var canvas = this.props.canvas;
        canvas.backgroundColor = color;
        canvas.renderAll();
        this.setState({
            backgroundColor: color
        });
        saveCanvasState(canvas);
    }

    refreshCanvas = (canvas) => {
        canvas.renderAll(canvas);
        saveCanvasState(canvas);
    }

    applyBGPattern = (result) => {
        this.deleteCanvasBg();
        var canvas = this.props.canvas;
        canvas.setBackgroundColor({
            source: result
        }, this.refreshCanvas.bind(this, canvas));
    }

    pixaybay = () => {
        // fetch("//pixabay.com/api/?key=11095386-871fd43c33a92700d9bffb82d&q=" + this.state.searchkey + "&image_type=photo&pretty=true&page=" + this.state.page + "&per_page=24&safesearch=true")
        //     .then(res => res.json())
        //     .then(
        //         (result) => {
        //             this.setState({
        //                 apiImg: result.hits
        //             });
        //         },
        //         (error) => {
        //             this.setState({
        //                 isLoaded: true,
        //                 error
        //             });
        //         }
        //     )
    }

    unsplash = () => {
        // fetch("//api.unsplash.com/search/photos/?client_id=" + this.state.client_id + "&per_page=24&query=" + this.state.unsplashsearchkey + "&page=" + this.state.pagenum + "")
        //     .then(res => res.json())
        //     .then(data => {
        //         this.setState({ unsplashImg: data.results });
        //     })
        //     .catch(err => {
        //         console.log('Error!', err);
        //     });
    }

    searchUnsplashimg = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Let's stop this event.
            e.stopPropagation(); // Really this time.
            this.setState({
                unsplashsearchkey: e.target.value
            }, () => {
                this.unsplash();
            });
        }
    }

    incermentpage = () => {
        this.setState({
            pagenum: this.state.pagenum + 1
        }, () => {
            this.unsplash();
        });
    }

    addImage = (result) => {
        var canvas = this.props.canvas;
        fabric.Image.fromURL(result, (image) => {
            image.set({
                left: 100,
                top: 100,
                padding: 10,
                cornersize: 10,
                scaleX: 1,
                scaleY: 1
            });
            canvas.add(image);
            image.scaleToWidth(200);
            canvas.setActiveObject(image);
            selectObject(canvas);
            saveCanvasState(canvas);
        }, {
            crossOrigin: 'anonymous'
        });
    }

    searchImage = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            this.setState({
                searchkey: e.target.value
            }, () => {
                this.pixaybay();
            });
        }
    }

    incerment = () => {
        this.setState({
            page: this.state.page + 1
        }, () => {
            this.pixaybay();
        });
    }

    toggle(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    imagetoggle(tab) {
        if (this.state.imgactiveTab !== tab) {
            this.setState({
                imgactiveTab: tab
            });
        }
    }

    render() {
        const styles = {
            grad1color: {
                background: `${this.state.grad1color}`,
            },
            grad2color: {
                background: `${this.state.grad2color}`,
            }
        };

        return (
            <div className="side-panel-container">
                <TabPanel tabId="vertical-tab-one">
                    <Container className="text-editer">
                        <Row>
                            <Col>
                                <p className="first-title text-center text-primary">Add some text to your artwork.</p>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <h1 className="big-title" onClick={this.addHeadingtxt}>Add Heading</h1>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <h3 className="sub-title" onClick={this.addSubheadingtxt}>Add Subheading</h3>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <h5 className="text" onClick={this.addText}>Add text</h5>
                            </Col>
                        </Row>
                    </Container>
                </TabPanel>
                <TabPanel tabId="vertical-tab-two">
                    <Container>
                        <Row>
                            <Col>
                                <p className="btn btn-primary btn-sm" onClick={this.showUploadPopup}>Upload BG</p>
                            </Col>
                            <Col>
                                <p className="btn btn-primary btn-sm" onClick={this.deleteCanvasBg}>Remove BG</p>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <p className="first-title">Solid Colors</p>
                                <div className="solid-colors">
                                    {INIT_SOLID_COLORS.map(item => (
                                        <span key={item} className="solidcolor" style={{ backgroundColor: item }} onClick={() => this.setBGcolor(item)} />
                                    ))}

                                    {this.state.bgcolArray.map((colorval, index) => {
                                        return (
                                            colorval
                                                ? <span key={index} style={{ background: colorval }} className="solidcolor" onClick={() => this.setBGcolor(colorval)}></span>
                                                : null
                                        )
                                    })}

                                    <span className="solidcolor" onClick={this.bgcolorOpen}>
                                        <span className="addcolor">+</span>
                                    </span>

                                    {this.state.displaybgColorPicker
                                        ? <div className="popover">
                                            <div className="cover" onClick={this.bgcolorClose} />
                                            <SketchPicker color={this.state.backgroundColor} onChangeComplete={this.setCanvasFill} />
                                        </div>
                                        : null
                                    }
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <p className="first-title">Gradients</p>
                                <div className="gradients-colors">
                                    <span className="grdcol1 grdcolor" onClick={() => this.setGradientBGcolor('#62ff00', 'yellow', 'vertical')} />
                                    <span className="grdcol2 grdcolor" onClick={() => this.setGradientBGcolor('red', 'yellow', 'horizontal')} />
                                    <span className="grdcol3 grdcolor" onClick={() => this.setGradientBGcolor('#ff9900', '#39d4cd', 'horizontal')} />
                                    <span className="grdcol4 grdcolor" onClick={() => this.setGradientBGcolor('rgba(255,0,0,0)', 'rgba(255,0,0,1)', 'horizontal')} />
                                    <span className="grdcol4 grdcolor" onClick={() => this.setGradientBGcolor('rgba(255,0,0,0)', 'rgba(255,0,0,1)', 'horizontal')} />

                                    <Popup
                                        trigger={<span className="grdcolor"><span className="addcolor">+</span></span>}
                                        position="top left"
                                        closeOnDocumentClick
                                    >
                                        <div className="gradcolorsection">
                                            <div className="grdsection">
                                                <div className="swatch" onClick={this.grad1colorOpen}>
                                                    <div className="grad-color" style={styles.grad1color} />
                                                </div>
                                                {this.state.displaygrad1ColorPicker
                                                    ? <div className="popover">
                                                        <div className="cover" onClick={this.grad1colorClose} />
                                                        <SketchPicker color={this.state.grad1color} onChangeComplete={this.setGradient1BGcolor} />
                                                    </div>
                                                    : null
                                                }
                                                <div className="swatch" onClick={this.grad2colorOpen}>
                                                    <div className="grad-color" style={styles.grad2color} />
                                                </div>
                                                {this.state.displaygrad2ColorPicker
                                                    ? <div className="popover">
                                                        <div className="cover" onClick={this.grad2colorClose} />
                                                        <SketchPicker color={this.state.grad2color} onChangeComplete={this.setGradient2BGcolor} />
                                                    </div>
                                                    : null
                                                }
                                            </div>
                                            <div className="grdsection">
                                                <div className="swatch" onClick={this.setVerticalgradient}>
                                                    <div className="grad-color verticalgradient" title="Vertical" />
                                                </div>
                                                <div className="swatch" onClick={this.setRadialgradient}>
                                                    <div className="grad-color radialgradient" title="Radial" />
                                                </div>
                                            </div>
                                        </div>
                                    </Popup>
                                </div>
                            </Col>
                        </Row>
                        {/* <Row>
                            <Col>
                                <p className="first-title">Patterns</p>
                                <div className="patterns">
                                    {INIT_PATTERN_IMAGES.map((item, index) => (
                                        <span
                                            key={index}
                                            className={`pattern${index + 1}`}
                                            onClick={() => this.applyBGPattern(item)}
                                        />
                                    ))}
                                </div>
                            </Col>
                        </Row> */}
                    </Container>
                </TabPanel>
                <TabPanel tabId="vertical-tab-three">
                    <Container className="text-editer">
                        <Nav tabs>
                            <Col sm="6">
                                <NavItem>
                                    <NavLink
                                        className={classnames({ active: this.state.imgactiveTab === '1' })}
                                        onClick={() => this.imagetoggle('1')}
                                    >
                                        Pixabay
                  </NavLink>
                                </NavItem>
                            </Col>
                            <Col sm="6">
                                <NavItem>
                                    <NavLink
                                        className={classnames({ active: this.state.imgactiveTab === '2' })}
                                        onClick={() => this.imagetoggle('2')}
                                    >
                                        Unsplash
                  </NavLink>
                                </NavItem>
                            </Col>
                        </Nav>
                        <TabContent activeTab={this.state.imgactiveTab}>
                            <TabPane tabId="1">
                                <Row>
                                    <Col sm="12">
                                        <div className="pixabaysection">
                                            <Form className="searchbar">
                                                <Input type="text" onKeyPress={(event) => this.searchImage(event)} placeholder="Search Images" />
                                            </Form>
                                            <div ref={this.iScrollRef} className="scroller" id="scroll-1">
                                                {this.state.apiImg.map((img, index) => (
                                                    <span className="image-wrapper" key={index} onClick={() => this.addImage(img.largeImageURL)}>
                                                        <img className="pixabay" src={img.largeImageURL} alt="" />
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </TabPane>
                            <TabPane tabId="2">
                                <Row>
                                    <Col sm="12">
                                        <div className="pixabaysection">
                                            <Form className="searchbar">
                                                <Input type="text" onKeyPress={(event) => this.searchUnsplashimg(event)} placeholder="Search Images" />
                                            </Form>
                                            <div ref={this.imgScrollRef} className="scroller" id="scroll-1">
                                                {this.state.unsplashImg.map((photo, index) => {
                                                    return (
                                                        <span className="image-wrapper" key={index} onClick={() => this.addImage(photo.urls.regular)}>
                                                            <img className="pixabay" src={photo.urls.regular} alt="" />
                                                        </span>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </TabPane>
                        </TabContent>
                    </Container>
                </TabPanel>

                <TabPanel tabId="vertical-tab-four">
                    <Container className="text-editer">
                        <Row>
                            <Col>
                                <Nav tabs>
                                    <Col sm="4">
                                        <NavItem>
                                            <NavLink
                                                className={classnames({ active: this.state.activeTab === '1' })}
                                                onClick={() => this.toggle('1')}
                                            >
                                                Shapes
                      </NavLink>
                                        </NavItem>
                                    </Col>
                                    <Col sm="4">
                                        <NavItem>
                                            <NavLink
                                                className={classnames({ active: this.state.activeTab === '2' })}
                                                onClick={() => this.toggle('2')}
                                            >
                                                Icons
                      </NavLink>
                                        </NavItem>
                                    </Col>
                                    <Col sm="4">
                                        <NavItem>
                                            <NavLink
                                                className={classnames({ active: this.state.activeTab === '3' })}
                                                onClick={() => { this.toggle('3'); }}
                                            >
                                                ClipArts
                      </NavLink>
                                        </NavItem>
                                    </Col>
                                </Nav>
                                <TabContent activeTab={this.state.activeTab}>
                                    <TabPane tabId="1">
                                        <Row>
                                            <Col sm="12">
                                                <p>Shapes</p>
                                                <div className="patterns shapes">
                                                    {INIT_ELEMENT_ICONS.map((item, index) => (
                                                        <span
                                                            key={index}
                                                            className={`shape${index + 1}`}
                                                            onClick={() => this.addSVG(item)}
                                                        />
                                                    ))}
                                                </div>
                                            </Col>
                                        </Row>
                                    </TabPane>
                                    {/* <TabPane tabId="2">
                                        <Row>
                                            <Col sm="12">
                                                <p>Icons</p>
                                                <div className="patterns shapes">
                                                    {INIT_ELEMENT_SHAPES.map((item, index) => (
                                                        <span
                                                            key={index}
                                                            className={`icon${index + 1}`}
                                                            onClick={() => this.addSVG(item)}
                                                        />
                                                    ))}
                                                </div>
                                            </Col>
                                        </Row>
                                    </TabPane> */}
                                    {/* <TabPane tabId="3">
                                        <Row>
                                            <Col sm="12">
                                                <p>Clip Arts</p>
                                                <div className="patterns shapes">
                                                    {INIT_ELEMENT_CLIPARTS.map((item, index) => (
                                                        <span
                                                            key={index}
                                                            className={`clipart${index + 1}`}
                                                            onClick={() => this.addSVG(item)}
                                                        />
                                                    ))}
                                                </div>
                                            </Col>
                                        </Row>
                                    </TabPane> */}
                                </TabContent>

                                {/* <p>Elements</p>
                                <p className="btn btn-primary" onClick={this.uploadIcon}>Upload Icon</p>
                                <div className="patterns elements">
                                    {INIT_ELEMENT_ELEMENTS.map((item, index) => (
                                        <span
                                            key={index}
                                            className={`element${index + 1}`}
                                            onClick={() => this.addSVG(item)}
                                        />
                                    ))}
                                </div> */}
                            </Col>
                        </Row>
                    </Container>
                </TabPanel>
            </div>
        );
    }
}

export default LeftPanel;
