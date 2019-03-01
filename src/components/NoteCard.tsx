import * as moment from 'moment';
import * as React from 'react';
import LoadingOverlay from 'react-loading-overlay';

import { Button, Card, Container, Grid, Label, Popup } from 'semantic-ui-react';

import { INote } from 'src/types/Note';
import Web3 = require('web3')
import { Transaction } from 'web3/eth/types';
import LoadingSpinner from './LoadingSpinner';
import './NoteCard.css'

export interface IProps {
    note: INote
    web3Instance: Web3
    fullInfo: boolean
}

export interface IState {
    timeTooltipOpen: boolean
    dataFile: string
    fileURL: string
    txTime: moment.Moment
    isPrintable: boolean
    fullTransaction: Transaction
    feePrice: string
    txPrice: string
    note: INote
    printableHEX: string
    fullInfo: boolean
}

class NoteCard extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            dataFile: "",
            feePrice: "",
            fileURL: "",
            fullInfo: props.fullInfo,
            fullTransaction: {} as Transaction,
            isPrintable: this.isPrintable(props.note.text_preview),
            note: props.note,
            printableHEX: "",
            timeTooltipOpen: false,
            txPrice: "",
            txTime: moment(props.note.tx_time)
        };
        this.noteLink = this.noteLink.bind(this)
        this.toggle = this.toggle.bind(this)
    }

    public async componentDidMount() {
        if (this.state.fullInfo) {
            const tx = await this.loadTx()
            const feePrice = await this.calculateTxPrice(tx.gas.toString(), true)
            const txPrice = await this.calculateTxPrice(tx.value, false)
            this.setState({ fullTransaction: tx, feePrice, txPrice })
        }
        if (this.props.note.data_type !== "text") {
            const web3 = this.props.web3Instance
            const tx = await this.loadTx()
            const txData = web3.utils.hexToBytes(tx.input)
            const base64data = Buffer.from(txData).toString('base64');
            const dataString = "data:" + this.props.note.data_type + ";base64," + base64data

            const file = this.base64toBlob(base64data, this.props.note.data_type)
            const fileURL = URL.createObjectURL(file);
            this.setState({ dataFile: dataString, fileURL })
        }
    }

    public render() {
        return (
            <Card style={this.state.fullInfo ? { wordWrap: "break-word", width: "auto" } : { wordWrap: "break-word" }}>
                <Card.Content>
                    <Card.Header>
                        <img src={this.netIcon(this.state.note.net_name)} className="noteImg" alt="img-1" />
                    </Card.Header>
                    <Card.Description>
                        {this.state.fullInfo ?
                            <Card.Meta>
                                <a href={this.noteLink(this.state.note.hash)} target="_blank">{this.state.note.hash}</a>
                            </Card.Meta> :
                            <Card.Meta>
                                <span style={{ color: "#007bff" }} >{this.state.note.hash}</span><br />
                                <Button color="teal" content="More info" size="mini" href={this.noteReadMore(this.state.note.hash)} target="_blank" />
                                {/* <a href={this.noteReadMore(this.state.note.hash)} target="_blank">More info</a>
                                </Label> */}
                            </Card.Meta>}
                        {this.state.dataFile !== "" &&
                            <Container style={{ placeItems: "center" }}>
                                {this.state.note.data_type.includes("image") &&
                                    <Grid.Row style={{ placeItems: "center" }}>
                                        <Grid.Column>
                                            <img
                                                onError={
                                                    // tslint:disable-next-line:jsx-no-lambda
                                                    (e) => {
                                                        this.setState({ dataFile: process.env.PUBLIC_URL + `images/not_found_icon.svg` })
                                                    }}
                                                src={this.state.dataFile} style={{ maxWidth: "200px", maxHeight: "200px" }} alt={this.state.note.hash} />
                                        </Grid.Column>
                                    </Grid.Row>}
                                <Grid.Row style={{ placeItems: "center" }}>
                                    <Grid.Column>
                                        <a href={this.state.fileURL} download={this.state.note.hash + "." + this.state.note.text_preview}>Download</a>
                                    </Grid.Column>
                                </Grid.Row>
                            </Container>}
                        {this.state.fullInfo ?
                            <LoadingOverlay
                                active={!this.state.fullTransaction.from}
                                fadeSpeed={500}
                                spinner={<LoadingSpinner />}>
                                <Grid columns={2}>
                                    <Grid.Row>
                                        <Grid.Column width="2"><strong>From:</strong></Grid.Column>
                                        <Grid.Column width="14">{this.state.fullTransaction.from}{" "}<Label color="blue" href={this.addrLink(this.state.fullTransaction.from)} target="_blank">Etherscan</Label></Grid.Column>
                                    </Grid.Row>
                                    <Grid.Row>
                                        <Grid.Column width="2"><strong>To:</strong></Grid.Column>
                                        <Grid.Column width="14">{this.state.fullTransaction.to}{" "}<Label color="blue" href={this.addrLink(this.state.fullTransaction.to)} target="_blank">Etherscan</Label></Grid.Column>
                                    </Grid.Row>
                                    <Grid.Row>
                                        <Grid.Column width="2"><strong>Fee:</strong></Grid.Column>
                                        <Grid.Column width="14">{this.state.fullTransaction.gasPrice} ({this.state.feePrice})</Grid.Column>
                                    </Grid.Row>
                                    <Grid.Row>
                                        <Grid.Column width="2"><strong>Value:</strong></Grid.Column>
                                        <Grid.Column width="14">{this.state.txPrice}</Grid.Column>
                                    </Grid.Row>
                                    <Grid.Row style={{ justifyContent: "center" }}>
                                        <Grid.Column width="2"><strong>Text:</strong></Grid.Column>
                                        <Grid.Column width="14"><i>{this.state.note.text_preview}</i></Grid.Column>
                                    </Grid.Row>
                                    <Grid.Row style={{ justifyContent: "center" }}>
                                        <Grid.Column width="2"><strong>HEX:</strong></Grid.Column>
                                        <Grid.Column width="14"><small>{this.state.fullTransaction.input}</small></Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </LoadingOverlay> :
                            this.state.printableHEX !== "" ?
                                <div><p><strong>Text:</strong> <i>{this.state.note.text_preview}</i></p><p><strong>HEX:</strong> <small>{this.state.printableHEX}</small></p></div> :
                                this.state.isPrintable ?
                                    <p><i>{this.state.note.text_preview}</i></p> :
                                    <Container><p>Could be not printable. <a href="javascript:void(0)" onClick={this.toggleViewUnknown}>View?</a></p></Container>}
                    </Card.Description>
                    <Popup position="bottom center" trigger={<small id={"timeTooltip_" + this.state.note.id} className="text-muted">{this.state.txTime.fromNow()}</small>} content={this.state.txTime.format('LLLL')} />

                </Card.Content>
                <Card.Content extra={true}>

                    <Label color="orange" size="tiny" style={{ textTransform: 'capitalize' }}>{this.state.note.data_type}</Label>{" "}
                    <Label color="orange" size="tiny" >Size {this.state.note.data_size}B</Label>{" "}
                    <Label color="orange" size="tiny" >Block #{this.state.note.block_num}</Label>

                </Card.Content>
                {/* <CardText>
                            <Tooltip placement="bottom" isOpen={this.state.timeTooltipOpen} target={"timeTooltip_" + this.state.note.id} toggle={this.toggle}>
                                <small>{this.state.txTime.format('LLLL')}</small>
                            </Tooltip>
                        </CardText> */}



                {/* <CardBody inverse="true" color="primary">

                </CardBody> */}
                {/* <CardFooter className="text-muted">
                    <Container>
                        <Badge color="secondary" pill={true} style={{ textTransform: 'capitalize' }}>{this.state.note.data_type}</Badge>{" "}
                        <Badge color="secondary" pill={true}>Size {this.state.note.data_size}B</Badge>{" "}
                        <Badge color="secondary" pill={true}>Block #{this.state.note.block_num}</Badge>
                    </Container>

                </CardFooter> */}
            </Card>
        );
    }

    private calculateTxPrice = async (wei: string, isFee: boolean) => {
        const web3 = this.props.web3Instance
        const gasPrice = await web3.eth.getGasPrice()
        const ethPrice = await this.getEthPrice()
        let weiBN = web3.utils.toBN(wei)
        if (isFee) {
            weiBN = weiBN.mul(web3.utils.toBN(gasPrice))
        }
        // weiBN = weiBN.mul(web3.utils.toBN(ethPrice))
        const eth = web3.utils.fromWei(weiBN.toString(), "ether").toString()

        return `${eth}ETH ≈${(parseFloat(eth) * ethPrice).toPrecision(2)}$`
    }

    private async getEthPrice() {
        const ethTicker = await fetch('https://api.coinmarketcap.com/v1/ticker/ethereum/')
        const json = await ethTicker.json()
        const price: number = json[0].price_usd
        return price
    }

    private noteLink(hash: string) {
        return "https://etherscan.io/tx/" + hash
    }

    private addrLink(hash: string) {
        return "https://etherscan.io/address/" + hash
    }

    private noteReadMore(hash: string) {
        return "/" + hash
    }

    private netIcon(net: string) {
        switch (net) {
            case "ethereum": return process.env.PUBLIC_URL + `images/eth_icon.svg`
        }
        return ""
    }

    private toggle = () => this.setState({ timeTooltipOpen: !this.state.timeTooltipOpen })

    private toggleViewUnknown = async () => {
        const tx = await this.loadTx()
        this.setState({ printableHEX: tx.input, fullTransaction: tx })
    }

    private loadTx = async () => {
        const web3 = this.props.web3Instance
        const tx = await web3.eth.getTransaction(this.props.note.hash)
        return tx
    }

    private base64toBlob(base64Data: string, contentType: string) {
        contentType = contentType || '';
        const sliceSize = 1024;
        const byteCharacters = atob(base64Data);
        const bytesLength = byteCharacters.length;
        const slicesCount = Math.ceil(bytesLength / sliceSize);
        const byteArrays = new Array(slicesCount);

        for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
            const begin = sliceIndex * sliceSize;
            const end = Math.min(begin + sliceSize, bytesLength);

            const bytes = new Array(end - begin);
            for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
                bytes[i] = byteCharacters[offset].charCodeAt(0);
            }
            byteArrays[sliceIndex] = new Uint8Array(bytes);
        }
        return new Blob(byteArrays, { type: contentType });
    }

    private isPrintable(input: string) {
        return input.replace(/[^\x20-\x7E]+/g, "") === input;
    }

}

export default NoteCard;