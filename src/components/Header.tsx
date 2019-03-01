// import * as moment from 'moment'
import * as React from 'react';
import { Button, Header as HeaderUi, Image, Segment } from 'semantic-ui-react';
import { WEB3_PROVIDER } from 'src/constants';
import Web3 = require('web3')
import NewNote from './NewNote';

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

    public render() {
        return (
            <Segment>
                {this.state.mode === "main" &&
                    <div>

                        <HeaderUi as='h1'>
                            <Image inline={true} href="/" src={process.env.PUBLIC_URL + `images/logo.png`} size="massive" />
                            <a href="/" style={{color: "#50d0df"}}>BlockNotes</a>
                        </HeaderUi>



                        <HeaderUi as='h2'>Look or search for published text, images, files on cryptocurrency blockchain.</HeaderUi>
                        <hr className="my-2" />
                        <p>We're not host images or files, and not taking any responsibility for data you can find here 🧐</p>
                        <p>Whole Ethereum blockchain presented, more blockchains will be added later. You can publish your own note in any type with help of our app here:</p>
                        <p className="lead">
                            <Button color="grey" content='Publish your own note' onClick={
                                // tslint:disable-next-line:jsx-no-lambda
                                () => this.onModeChange("newNote")} />
                        </p>
                    </div>}
                {this.state.mode === "newNote" &&
                    <div>
                        <NewNote web3Instance={this.state.web3Instance} />
                        <p className="lead">
                            <Button content='Go back' icon='left arrow' labelPosition='left' onClick={
                                // tslint:disable-next-line:jsx-no-lambda
                                () => this.onModeChange("main")} />
                        </p>

                    </div>}
            </Segment>
        );
    }

    private onModeChange = (mode: string) => this.setState({ mode })

}

export default Header;