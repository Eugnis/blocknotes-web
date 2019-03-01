// import * as moment from 'moment'
import * as React from 'react';
import ReactGA from 'react-ga';
import { RouteComponentProps } from 'react-router-dom';
import { Container, Grid } from 'semantic-ui-react';
// import {
//     Col,
//     Container,
//     Row,
// } from 'reactstrap';
// import CardBody from 'reactstrap/lib/CardBody';
import { API_URL, WEB3_PROVIDER } from 'src/constants';
import { INote } from 'src/types/Note';
import Web3 = require('web3')
import Footer from './Footer';
import Header from './Header';
import IconGithub from './IconGithub';
import NoteCard from './NoteCard';

export interface IProps extends RouteComponentProps<any> {
}

export interface IState {
    timeTooltipOpen: boolean
    note: INote
    web3Instance: Web3
}

class NoteView extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            note: {} as INote,
            timeTooltipOpen: false,
            web3Instance: new Web3(WEB3_PROVIDER)
        };
        this.noteLink = this.noteLink.bind(this)
        this.toggle = this.toggle.bind(this)
    }

    public async componentDidMount() {
        ReactGA.pageview(window.location.pathname + window.location.search);
        await this.loadNote(this.props.match.params.hash)
    }

    public render() {
        return (
            <div>
                <IconGithub />
                <Container style={{ paddingTop: 10 }}>
                    <Grid.Row>
                        <Grid.Column sm="12">
                            <Header />
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row style={{ marginTop: "1rem" }}>
                        <Grid.Column width="2">
                            {this.state.note.text_preview && <NoteCard note={this.state.note} web3Instance={this.state.web3Instance} fullInfo={true} />}

                        </Grid.Column>
                    </Grid.Row>
                </Container>
                <Footer />
            </div>
        );
    }

    private noteLink(hash: string) {
        return "https://etherscan.io/tx/" + hash
    }

    private toggle = () => this.setState({ timeTooltipOpen: !this.state.timeTooltipOpen })

    private async loadNote(hash: string) {
        try {
            const notesReq = await fetch(API_URL + "/note/view/" + hash, {
                method: 'GET'
            })
            const noteJson: INote = await notesReq.json()
            this.setState({ note: noteJson })
        }
        catch (err) { process.stdout.write(err) }
    }

}

export default NoteView;