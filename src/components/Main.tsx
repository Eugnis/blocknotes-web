import * as React from 'react';
import ReactGA from 'react-ga';
import {
    Button,
    Card,
    Container,
    Dropdown,
    DropdownItemProps,
    DropdownProps,
    Grid,
    Icon,
    Input,
    Menu,
    Pagination,
    Placeholder,
    Segment,
    Select,
    Sticky
} from 'semantic-ui-react'
import { API_URL, DATA_TYPES, SEARCH_TYPES, WEB3_PROVIDER } from 'src/constants';
import { IApiResponse } from 'src/types/ApiResponse';
import { INote } from 'src/types/Note';
import { INoteSearch } from 'src/types/NoteSearch';
import Web3 = require('web3')
import Footer from './Footer';
import Header from './Header';
import IconGithub from './IconGithub';
// import LoadingSpinner from './LoadingSpinner';
import './Main.css'
import NoteCard from './NoteCard';

export interface IState {
    from: number
    quantity: number
    notes: INote[]
    searchText: string
    searchType: string
    searchTypePlaceholder: string
    dataType: string
    web3Instance: Web3
    loading: boolean
    totalCount: number
    totalPages: number
    activePage: number
}

class Main extends React.Component<{}, IState> {
    private contextRef = React.createRef<HTMLDivElement>()

    constructor(props: {}) {
        super(props);
        this.state = {
            activePage: 1,
            dataType: DATA_TYPES[0][1],
            from: 0,
            loading: true,
            notes: [],
            quantity: 50,
            searchText: "",
            searchType: SEARCH_TYPES[0][1],
            searchTypePlaceholder: SEARCH_TYPES[0][2],
            totalCount: 0,
            totalPages: 0,
            web3Instance: new Web3(WEB3_PROVIDER)
        };
        this.loadNotes = this.loadNotes.bind(this)
    }

    public async componentDidMount() {
        ReactGA.pageview(window.location.pathname + window.location.search);
        await this.loadNotes(this.state.activePage)
    }

    public getOptions = (arr: string[][]) => arr.map((val, i) => {
        return { key: i, text: val[0], value: val[1] } as DropdownItemProps
    })

    public handlePaginationChange = async (e: any, { activePage }: any) => {
        await this.loadNotes(activePage);
    }

    public refreshNotes = async () => await this.loadNotes(this.state.activePage)


    public render() {
        return (
            <div className="bg-light">
                <IconGithub />
                <Container style={{ paddingTop: "1rem" }}>
                    <Header />
                    <Sticky context={this.contextRef.current!}>
                        <Menu stackable={true}>
                            <Menu.Menu position="left">
                                <Menu.Item>
                                    <Button color="violet" basic={true}  icon='refresh' labelPosition='left' content="Refresh" onClick={this.refreshNotes}/>
                                </Menu.Item>
                                <Menu.Item>
                                    <Pagination
                                        ellipsisItem={{ content: <Icon name='ellipsis horizontal' />, icon: true }}
                                        onPageChange={this.handlePaginationChange}
                                        pointing={true}
                                        secondary={true}
                                        boundaryRange={0}
                                        defaultActivePage={this.state.activePage}
                                        totalPages={this.state.totalPages}
                                    />
                                </Menu.Item>
                            </Menu.Menu>
                            <Menu.Menu>
                                <Menu.Item>
                                    <Input type='text' placeholder={this.state.searchTypePlaceholder} value={this.state.searchText} onChange={this.onSearchTextChange} action={true}>
                                        <Select compact={true} options={this.getOptions(SEARCH_TYPES)} defaultValue='textpreview' onChange={
                                            // tslint:disable-next-line:jsx-no-lambda
                                            (e: any, { value }: DropdownProps) => {
                                                const placeholder = SEARCH_TYPES.find((val) => val[1] === value)!
                                                this.onSearchTypeChange(value as string, placeholder[2])
                                            }
                                        } />
                                        <input />
                                        <Button type='submit' onClick={this.onSearchText}>Search</Button>
                                    </Input>
                                </Menu.Item>
                            </Menu.Menu>
                            <Menu.Menu position="right">
                                <Menu.Item>
                                    <Dropdown
                                        inline={true}
                                        header='Choose data type'
                                        options={this.getOptions(DATA_TYPES)}
                                        defaultValue={this.state.dataType}
                                        onChange={
                                            // tslint:disable-next-line:jsx-no-lambda
                                            (e: any, { value }) => this.onDataTypeChange(value as string)
                                        }
                                    />
                                </Menu.Item>
                            </Menu.Menu>
                        </Menu >
                    </Sticky>

                    <div ref={this.contextRef} style={{ marginTop: "1rem" }}>
                        {this.state.loading &&
                            <Grid columns={3} stackable={true}>
                                <Grid.Column>
                                    <Segment raised={true}>
                                        <Placeholder>
                                            <Placeholder.Header image={true}>
                                                <Placeholder.Line />
                                                <Placeholder.Line />
                                            </Placeholder.Header>
                                            <Placeholder.Paragraph>
                                                <Placeholder.Line length='medium' />
                                                <Placeholder.Line length='short' />
                                            </Placeholder.Paragraph>
                                        </Placeholder>
                                    </Segment>
                                </Grid.Column>
                                <Grid.Column>
                                    <Segment raised={true}>
                                        <Placeholder>
                                            <Placeholder.Header image={true}>
                                                <Placeholder.Line />
                                                <Placeholder.Line />
                                            </Placeholder.Header>
                                            <Placeholder.Paragraph>
                                                <Placeholder.Line length='medium' />
                                                <Placeholder.Line length='short' />
                                            </Placeholder.Paragraph>
                                        </Placeholder>
                                    </Segment>
                                </Grid.Column>
                                <Grid.Column>
                                    <Segment raised={true}>
                                        <Placeholder>
                                            <Placeholder.Header image={true}>
                                                <Placeholder.Line />
                                                <Placeholder.Line />
                                            </Placeholder.Header>
                                            <Placeholder.Paragraph>
                                                <Placeholder.Line length='medium' />
                                                <Placeholder.Line length='short' />
                                            </Placeholder.Paragraph>
                                        </Placeholder>
                                    </Segment>
                                </Grid.Column>
                            </Grid>
                        }
                        {this.state.notes.length > 0 &&
                            <Card.Group itemsPerRow={3}>
                                {this.state.notes.map(val => {
                                    return <NoteCard key={val.id} note={val} fullInfo={false} web3Instance={this.state.web3Instance} />
                                })}
                            </Card.Group>
                        }
                    </div>
                </Container>

                <Footer />
            </div >

        );
    }



    private onSearchTextChange = (event: React.ChangeEvent<HTMLInputElement>) => this.setState({ searchText: event.target.value })
    private onSearchTypeChange = (type: string, text: string) => this.setState({ searchType: type, searchTypePlaceholder: text })

    private onSearchText = async () => {
        await this.loadNotes(1)
    }

    private onDataTypeChange = async (type: string) => {
        if (type[1] !== "text" && this.state.searchType === "textpreview") {
            this.setState({ searchType: SEARCH_TYPES[1][1], searchText: "" })
        }
        await this.setState({ dataType: type })
        await this.loadNotes(1)
    }



    private async loadNotes(page: number) {
        if (!this.state.loading) {
            this.setState({ loading: true })
        }
        try {
            const from = (page - 1) * this.state.quantity
            const noteSearch = {
                count: this.state.quantity,
                data_type: this.state.dataType,
                from,
                net_name: "ethereum",
                net_type: "mainnet"
            } as INoteSearch
            if (this.state.searchText !== "") {
                noteSearch.search_text = this.state.searchText
                noteSearch.search_type = this.state.searchType
            }
            const notesReq = await fetch(API_URL + "/note/list", {
                body: JSON.stringify(noteSearch),
                method: 'POST'
            })
            const apiResp: IApiResponse = await notesReq.json()
            const notesListJson = apiResp.data as INote[]
            const totalPages = Math.ceil(apiResp.count / this.state.quantity)

            this.setState({ notes: notesListJson, activePage: page, totalCount: apiResp.count, totalPages, loading: false })
        }
        catch (err) { console.log(err) }
    }

}

export default Main;