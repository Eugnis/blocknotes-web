import * as React from 'react';
import LoadingOverlay from 'react-loading-overlay';
import {
    Button,
    CardColumns,
    Col,
    Container,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupButtonDropdown,
    Jumbotron,
    Nav,
    Navbar,
    // NavbarBrand,
    Pagination,
    PaginationItem,
    PaginationLink,
    Row,

} from 'reactstrap';
import { API_URL, DATA_TYPES, SEARCH_TYPES, WEB3_PROVIDER } from 'src/constants';
import { INote } from 'src/types/Note';
import { INoteSearch } from 'src/types/NoteSearch';
import Web3 = require('web3')
import './Main.css'
import NewNote from './NewNote';
import NoteCard from './NoteCard';

// export interface IProps {

// }

export interface IState {
    from: number
    quantity: number
    notes: INote[]
    searchText: string
    searchType: string[]
    searchTypeOpen: boolean
    dataType: string[]
    dataTypeOpen: boolean
    web3Instance: Web3
    loading: boolean
    mode: string
}

class Main extends React.Component<{}, IState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            dataType: DATA_TYPES[0],
            dataTypeOpen: false,
            from: 0,
            loading: true,
            mode: "main",
            notes: [],
            quantity: 100,
            searchText: "",
            searchType: SEARCH_TYPES[0],
            searchTypeOpen: false,
            web3Instance: new Web3(WEB3_PROVIDER)
        };
        this.loadNotes = this.loadNotes.bind(this)
    }

    public async componentDidMount() {
        await this.loadNotes()
    }

    public render() {
        return (
            <div className="bg-light">
                <a href="https://github.com/Eugnis/blocknotes-web" target="_blank" className="github-corner" aria-label="View source on GitHub">
                    <svg width={80} height={80} viewBox="0 0 250 250" style={{ fill: "#151513", color: "#fff", position: "absolute", top: 0, border: 0, right: 0 }}> <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z" /> <path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style={{ transformOrigin: '130px 106px' }} className="octo-arm" /> <path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" className="octo-body" /></svg></a><style dangerouslySetInnerHTML={{ __html: ".github-corner:hover .octo-arm{animation: octocat-wave 560ms ease-in-out}@keyframes octocat-wave{0 %,100%{transform: rotate(0)}20%,60%{transform: rotate(-25deg)}40%,80%{transform: rotate(10deg)}}@media (max-width:500px){.github - corner: hover .octo-arm{animation: none}.github-corner .octo-arm{animation: octocat-wave 560ms ease-in-out}}" }} />
                <Container style={{ paddingTop: 10 }}>

                    {/* <div style={{ marginTop: 50 }}> */}
                    <Jumbotron>
                        {this.state.mode === "main" &&
                            <div>
                                <h1 className="display-3">BlockNotes</h1>
                                <p className="lead">Look or search for published text, images, files on cryptocurrency blockchain.</p>
                                <hr className="my-2" />
                                <p>We're not host images or files, and not taking any responsibility for data you can find here :)</p>
                                <p>Whole Ethereum blockchain presented, more blockchains will be added later. You can publish your own note in any type with help of our app here:</p>
                                <p className="lead">
                                    {/* <Button color="primary">Learn More</Button> */}
                                    <Button color="primary" onClick={
                                        // tslint:disable-next-line:jsx-no-lambda
                                        () => this.onModeChange("newNote")}>Publish your own note</Button>
                                </p>
                            </div>}
                        {this.state.mode === "newNote" &&
                            <div>
                                <NewNote web3Instance={this.state.web3Instance} />
                                {/* <h1 className="display-3">Creating new note</h1> */}
                                <p className="lead">
                                    <Button color="primary" onClick={
                                        // tslint:disable-next-line:jsx-no-lambda
                                        () => this.onModeChange("main")}>Go back</Button>
                                </p>

                            </div>}
                    </Jumbotron>
                    {/* </div> */}
                    <Navbar style={{placeContent: "center"}} color="light" light={true} expand="md" sticky="top" >
                        {/* <NavbarBrand href="/">reactstrap</NavbarBrand> */}
                        <Nav  pills={true} className="bg-light" navbar={true}>
                            
                                <Row>
                                    <Col sm="3">
                                        <Row>
                                            <Button outline={true} color="info" onClick={this.loadNotes}>Refresh</Button>
                                            <Pagination aria-label="Page navigation example">
                                                <PaginationItem disabled={this.state.notes.length < this.state.quantity}>
                                                    <PaginationLink previous={true} onClick={this.pageBack} />
                                                </PaginationItem>

                                                <PaginationItem disabled={this.state.from === 0}>
                                                    <PaginationLink next={true} onClick={this.pageForward} />
                                                </PaginationItem>
                                            </Pagination>
                                        </Row>
                                        {/* 
                                    <Button onClick={this.pageBack}>{"<-"}</Button>
                                    <Button disabled={this.state.from === 0} onClick={this.pageForward}>{"->"}</Button> */}
                                    </Col>
                                    <Col sm="6">
                                        <InputGroup>
                                            <InputGroupButtonDropdown addonType="prepend" isOpen={this.state.searchTypeOpen} toggle={this.toggleSearchType}>
                                                <DropdownToggle outline={true} color="secondary" caret={true}>
                                                    {this.state.searchType[0]}
                                                </DropdownToggle>
                                                <DropdownMenu>
                                                    {SEARCH_TYPES.map(val => <DropdownItem disabled={this.state.searchType === val || (val[1] === "textpreview" && this.state.dataType[1] !== "text")} key={val[1]} onClick={
                                                        // tslint:disable-next-line:jsx-no-lambda
                                                        () => this.onSearchTypeChange(val)
                                                    }>{val[0]}</DropdownItem>)}
                                                </DropdownMenu>
                                            </InputGroupButtonDropdown>
                                            <Input type="text" placeholder={this.state.searchType[2]} value={this.state.searchText} onChange={this.onSearchTextChange} />
                                            <InputGroupAddon addonType="append">
                                                <Button outline={true} color="success" onClick={this.onSearchText}>Search</Button>
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </Col>
                                    <Col sm="3">
                                        <Dropdown isOpen={this.state.dataTypeOpen} toggle={this.toggleDataType}>
                                            <DropdownToggle color="info" caret={true}>
                                                {this.state.dataType[0]}
                                            </DropdownToggle>
                                            <DropdownMenu>
                                                {DATA_TYPES.map(val => <DropdownItem disabled={this.state.dataType === val} key={val[1]} onClick={
                                                    // tslint:disable-next-line:jsx-no-lambda
                                                    () => this.onDataTypeChange(val)
                                                }>{val[0]}</DropdownItem>)}
                                            </DropdownMenu>
                                        </Dropdown>
                                    </Col>
                                </Row>
                        </Nav>
                    </Navbar>

                    {/* <br /> */}
                    <LoadingOverlay
                        active={this.state.loading}
                        fadeSpeed={500}
                        spinner={<div className="lds-grid">
                            <div />
                            <div />
                            <div />
                            <div />
                            <div />
                            <div />
                            <div />
                            <div />
                            <div />
                        </div>}
                    >
                        <Row>
                            <Col md="12">

                                {this.state.notes.length > 0 &&
                                    <CardColumns>
                                        {this.state.notes.map(val => {
                                            return <NoteCard key={val.id} note={val} fullInfo={false} web3Instance={this.state.web3Instance} />
                                        })}
                                    </CardColumns>
                                }



                            </Col>
                        </Row>
                    </LoadingOverlay>
                </Container>
            </div>

        );
    }

    private onSearchTextChange = (event: React.ChangeEvent<HTMLInputElement>) => this.setState({ searchText: event.target.value })
    private onSearchTypeChange = (type: string[]) => this.setState({ searchType: type })
    private onModeChange = (mode: string) => this.setState({ mode })

    // private onScroll = () => {
    //     console.log("skroll!", window.pageYOffset)
    //     if (window.pageYOffset > this.state.fixedNav) {
    //         if (this.state.headerSticky !== true) {
    //             this.setState({ headerSticky: true })
    //         }
    //     } else {
    //         if (this.state.headerSticky !== false) {
    //             this.setState({ headerSticky: false })
    //         }
    //     }
    // }

    private onSearchText = async () => {
        await this.loadNotes()
    }

    private pageBack = async () => {
        const from = this.state.quantity + this.state.from
        await this.setState({ from })
        await this.loadNotes()
    }

    private pageForward = async () => {
        let from = this.state.from - this.state.quantity
        if (from < 0) {
            from = 0
        }
        await this.setState({ from })
        await this.loadNotes()
    }

    private toggleSearchType = () => this.setState({ searchTypeOpen: !this.state.searchTypeOpen })
    private toggleDataType = () => this.setState({ dataTypeOpen: !this.state.dataTypeOpen })
    private onDataTypeChange = async (type: string[]) => {
        if (type[1] !== "text" && this.state.searchType[1] === "textpreview") {
            this.setState({ searchType: SEARCH_TYPES[1], searchText: "" })
        }
        await this.setState({ dataType: type, from: 0, quantity: 100 })
        await this.loadNotes()
    }



    private async loadNotes() {
        if (!this.state.loading) {
            this.setState({ loading: true })
        }
        try {
            const noteSearch = {
                count: this.state.quantity,
                data_type: this.state.dataType[1],
                from: this.state.from,
                net_name: "ethereum",
                net_type: "mainnet"
            } as INoteSearch
            if (this.state.searchText !== "") {
                noteSearch.search_text = this.state.searchText
                noteSearch.search_type = this.state.searchType[1]
            }
            const notesReq = await fetch(API_URL + "/note/list", {
                body: JSON.stringify(noteSearch),
                method: 'POST'
            })
            // console.log(await notesReq.text())
            const notesListJson: INote[] = await notesReq.json()
            this.setState({ notes: notesListJson, loading: false })
        }
        catch (err) { console.log(err) }
    }

}

export default Main;