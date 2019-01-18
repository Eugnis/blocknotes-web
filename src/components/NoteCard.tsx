import * as moment from 'moment'
import * as React from 'react';
import {
    Badge,
    Card,
    CardFooter,
    CardHeader,
    CardText,
    CardTitle,
    Col,
    NavLink,
    Row,
    Tooltip,
} from 'reactstrap';
import CardBody from 'reactstrap/lib/CardBody';
import Container from 'reactstrap/lib/Container';
// import { IMAGE_404 } from 'src/constants';
import { INote } from 'src/types/Note';
import Web3 = require('web3')
import { Transaction } from 'web3/eth/types';
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
            // console.log(this.props.note.data_type, base64data)
            const dataString = "data:" + this.props.note.data_type + ";base64," + base64data

            const file = this.base64toBlob(base64data, this.props.note.data_type)
            const fileURL = URL.createObjectURL(file);
            this.setState({ dataFile: dataString, fileURL })
        }
    }

    public render() {
        return (
            <Card>
                <CardHeader>
                    <img src={this.netIcon(this.state.note.net_name)} className="noteImg" alt="img-1" />
                </CardHeader>
                <CardBody inverse="true" color="primary">
                    {this.state.fullInfo ?
                        <CardTitle>
                            <NavLink href={this.noteLink(this.state.note.hash)} target="_blank">{this.state.note.hash}</NavLink>
                        </CardTitle> :
                        <CardTitle>
                            <span style={{color:"#007bff"}} >{this.state.note.hash}</span><br />
                            <Badge color="info" href={this.noteReadMore(this.state.note.hash)} target="_blank">More info</Badge>
                        </CardTitle>}
                        {this.state.dataFile !== "" &&
                        <Container style={{ placeItems: "center" }}>
                            {this.state.note.data_type.includes("image") &&
                                <Row style={{ placeItems: "center" }}>
                                    <Col>
                                        <img
                                            onError={
                                                // tslint:disable-next-line:jsx-no-lambda
                                                (e) => {
                                                    this.setState({ dataFile: process.env.PUBLIC_URL + `images/not_found_icon.svg` })
                                                }}
                                            src={this.state.dataFile} style={{ maxWidth: "200px", maxHeight: "200px" }} alt={this.state.note.hash} />
                                    </Col>
                                </Row>}
                            <Row style={{ placeItems: "center" }}>
                                <Col>
                                    <a href={this.state.fileURL} download={this.state.note.hash + "." + this.state.note.text_preview}>Download</a>
                                </Col>
                            </Row>
                        </Container>
                    }
                        {this.state.fullInfo ?
                            this.state.fullTransaction.from &&
                            <Container >
                                <Row style={{justifyContent: "center"}}>
                                    <Col md="1"><strong>From:</strong></Col>
                                    <Col md="6">{this.state.fullTransaction.from}{" "}<Badge color="info" href={this.addrLink(this.state.fullTransaction.from)} target="_blank">Etherscan</Badge></Col>
                                </Row>
                                <Row style={{justifyContent: "center"}}>
                                    <Col md="1"><strong>To:</strong></Col>
                                    <Col md="6">{this.state.fullTransaction.to}{" "}<Badge color="info" href={this.addrLink(this.state.fullTransaction.to)} target="_blank">Etherscan</Badge></Col>
                                </Row>
                                <Row style={{justifyContent: "center"}}>
                                    <Col md="1"><strong>Fee:</strong></Col>
                                    <Col md="6">{this.state.fullTransaction.gasPrice} ({this.state.feePrice})</Col>
                                </Row>
                                <Row style={{justifyContent: "center"}}>
                                    <Col md="1"><strong>Value:</strong></Col>
                                    <Col md="6">{this.state.txPrice}</Col>
                                </Row>
                                <Row style={{justifyContent: "center"}}>
                                    <Col md="1"><strong>Text:</strong></Col>
                                    <Col md="6">{this.state.note.text_preview}</Col>
                                </Row>
                                <Row style={{justifyContent: "center"}}>
                                    <Col md="1"><strong>HEX:</strong></Col>
                                    <Col md="6">{this.state.fullTransaction.input}</Col>
                                </Row>
                                {/* From: {this.state.fullTransaction.from}<Badge color="info" href={this.addrLink(this.state.fullTransaction.from)} target="_blank">Etherscan</Badge><br />
                                To: {this.state.fullTransaction.to}<Badge color="info" href={this.addrLink(this.state.fullTransaction.to)} target="_blank">Etherscan</Badge><br />
                                Fee: {this.state.fullTransaction.gasPrice} ({this.state.feePrice})<br />
                                Value: {this.state.txPrice}<br />
                                Text: {this.state.note.text_preview}<br />
                                HEX: {this.state.fullTransaction.input}<br /> */}
                            </Container> : this.state.printableHEX !== "" ? <code>Text: {this.state.note.text_preview}<br />HEX: {this.state.printableHEX}</code> :
                                this.state.isPrintable ? <code>{this.state.note.text_preview}</code> : <code>Could be not printable. <a href="javascript:void(0)" onClick={this.toggleViewUnknown}>View?</a></code>}
                        {/* <code>{this.convertUnicode(this.props.note.text_preview)}</code> */}
                    <CardText>
                        <small id={"timeTooltip_" + this.state.note.id} className="text-muted">{this.state.txTime.fromNow()}</small>
                        <Tooltip placement="bottom" isOpen={this.state.timeTooltipOpen} target={"timeTooltip_" + this.state.note.id} toggle={this.toggle}>
                            <small>{this.state.txTime.format('LLLL')}</small>
                        </Tooltip>
                    </CardText>
                </CardBody>
                <CardFooter className="text-muted">
                    <Container>
                        <Badge color="secondary" pill={true} style={{ textTransform: 'capitalize' }}>{this.state.note.data_type}</Badge>{" "}
                        <Badge color="secondary" pill={true}>Size {this.state.note.data_size}B</Badge>{" "}
                        <Badge color="secondary" pill={true}>Block #{this.state.note.block_num}</Badge>
                    </Container>

                </CardFooter>
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
        // return "/" + hash
        return "https://etherscan.io/tx/" + hash
    }

    private addrLink(hash: string) {
        // return "/" + hash
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