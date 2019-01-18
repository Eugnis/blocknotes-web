// import * as moment from 'moment'
import * as React from 'react';
// import { RouteComponentProps } from 'react-router-dom';
import {
    Button,
    Jumbotron,
} from 'reactstrap';
// import CardBody from 'reactstrap/lib/CardBody';
import { WEB3_PROVIDER } from 'src/constants';
import Web3 = require('web3')
import NewNote from './NewNote';
// import NoteCard from './NoteCard';

// export interface IProps{
// }

export interface IState {
    mode: string
    web3Instance: Web3
}

class Header extends React.Component<{}, IState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            mode: "main",
            web3Instance: new Web3(WEB3_PROVIDER)
        };

    }

    // public async componentDidMount() {

    // }

    public render() {
        // const txTime = moment(this.state.note.tx_time)
        return (
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
        );
    }

    private onModeChange = (mode: string) => this.setState({ mode })

}

export default Header;