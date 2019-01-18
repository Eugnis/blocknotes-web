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
import Footer from './Footer';
import Header from './Header';
import IconGithub from './IconGithub';
import './Main.css'
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
    // mode: string
}

class Main extends React.Component<{}, IState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            dataType: DATA_TYPES[0],
            dataTypeOpen: false,
            from: 0,
            loading: true,
            // mode: "main",
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
                <IconGithub />
                <Container style={{ paddingTop: 10 }}>

                    {/* <div style={{ marginTop: 50 }}> */}
                    <Header />
                    {/* </div> */}
                    <Navbar style={{ placeContent: "center" }} color="light" light={true} expand="md" sticky="top" >
                        {/* <NavbarBrand href="/">reactstrap</NavbarBrand> */}
                        <Nav pills={true} navbar={true}>

                            <Row>
                                <Col sm="3">
                                    <Row>
                                        <Col sm="6">
                                            <Button outline={true} color="info" onClick={this.loadNotes}>Refresh</Button>
                                        </Col>
                                        <Col sm="6">
                                            <Pagination aria-label="navigation">
                                                <PaginationItem disabled={this.state.notes.length < this.state.quantity}>
                                                    <PaginationLink previous={true} onClick={this.pageBack} />
                                                </PaginationItem>

                                                <PaginationItem disabled={this.state.from === 0}>
                                                    <PaginationLink next={true} onClick={this.pageForward} />
                                                </PaginationItem>
                                            </Pagination>
                                        </Col>

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
                <Footer />
            </div>

        );
    }

    private onSearchTextChange = (event: React.ChangeEvent<HTMLInputElement>) => this.setState({ searchText: event.target.value })
    private onSearchTypeChange = (type: string[]) => this.setState({ searchType: type })
    // private onModeChange = (mode: string) => this.setState({ mode })

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