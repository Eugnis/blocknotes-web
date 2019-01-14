// import * as moment from 'moment'
import * as React from 'react';
import { toast } from 'react-toastify';
// import { RouteComponentProps } from 'react-router-dom';
import {
    Alert,
    Button,
    ButtonGroup,
    // CardText,
    // CardTitle,
    // CustomInput,
    Card,
    CardFooter,
    CardHeader,
    Col,
    Container,
    FormGroup,
    FormText,
    Input,
    Label,
    // NavLink,
    // Tooltip,
} from 'reactstrap';
import CardBody from 'reactstrap/lib/CardBody';
import { DATA_TYPES_NEW, DEFAULT_ADDRESS_ETH, NETWORK_TYPE } from 'src/constants';
import Web3 = require('web3')
import { Tx } from 'web3/eth/types';
// import Container from 'reactstrap/lib/Container';

// import { API_URL } from 'src/constants';
// import { INote } from 'src/types/Note';

export interface IProps {
    web3Instance: Web3
}

export interface IState {
    dataType: string[]
    network: string
    dataText: string
    dataFile: File
    gasPrice: number
    estGas: number
    estPrice: string
    ethPrice: number
    dataLength: number
    publishType: string
    publishDataHex: string
    notePublished: string
    metaMaskNetwork: boolean | string
    isProcessing: boolean
}

class NewNote extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            dataFile: {} as File,
            dataLength: 0,
            dataText: "",
            dataType: DATA_TYPES_NEW[0],
            estGas: 0,
            estPrice: "Fill fields to calculate",
            ethPrice: 0,
            gasPrice: 0,
            isProcessing: false,
            metaMaskNetwork: this.checkMetamaskNet(),
            network: "ethereum",
            notePublished: "",
            publishDataHex: "",
            publishType: "",

        };
        // this.noteLink = this.noteLink.bind(this)
        // this.toggle = this.toggle.bind(this)
    }

    public async componentDidMount() {
        await this.getEthPrice()
        // await this.loadNote(this.props.match.params.hash)
    }

    public render() {
        // const txTime = moment(this.state.note.tx_time)
        return (
            <div>
                <Card>
                    <CardHeader tag="h3">Creating new note</CardHeader>
                    <CardBody inverse="true" color="primary">
                        <FormGroup>
                            <Label for="networkSelect">Network</Label>
                            <div>
                                <ButtonGroup id="networkSelect">
                                    {NETWORK_TYPE.map(val => <Button key={val} color={this.state.network === val ? "primary" : "secondary"} onClick={
                                        // tslint:disable-next-line:jsx-no-lambda
                                        () => this.onNetworkTypeChange(val)
                                    }><img src={this.netIcon(val)} height="50px" alt={val} /></Button>)}
                                </ButtonGroup>
                            </div>
                        </FormGroup>
                        <FormGroup>
                            <Label for="dataTypeSelect">Data type</Label>
                            <div>
                                <ButtonGroup id="dataTypeSelect">
                                    {DATA_TYPES_NEW.map(val => <Button key={val[1]} color={this.state.dataType === val ? "primary" : "secondary"} onClick={
                                        // tslint:disable-next-line:jsx-no-lambda
                                        () => this.onDataTypeChange(val)
                                    }>{val[0]}</Button>)}
                                </ButtonGroup>
                            </div>
                        </FormGroup>
                        {this.state.dataType === DATA_TYPES_NEW[0] &&
                            <FormGroup row={true}>
                                <Label for="noteText" sm={2}>Text Data</Label>
                                <Col sm={10}>
                                    <Input disabled={this.state.isProcessing} type="textarea" name="text" id="noteText" value={this.state.dataText} onChange={this.onTextChange} />
                                    <FormText color="muted">Data will be encoded in HEX and published in blockchain. Anyone can view it</FormText>
                                </Col>
                            </FormGroup>}
                        {this.state.dataType === DATA_TYPES_NEW[1] &&
                            <FormGroup row={true}>
                                <Label for="noteFile" sm={2}>File (Current max 115KB)</Label>
                                <Col sm={10}>
                                    <Input disabled={this.state.isProcessing} type="file" name="file" id="noteFile" onChange={this.onFileAdded} />
                                    <FormText color="muted">
                                        Data will be encoded in HEX and published in blockchain. Anyone can view it
                                     </FormText>
                                </Col>
                            </FormGroup>}
                    </CardBody>
                    <CardFooter className="text-muted">
                        <div>Est. fee price for {this.state.dataLength} bytes: {this.state.estPrice}</div>
                        {this.state.dataLength > 0 && this.state.publishDataHex !== "" && <Container>
                                <Button onClick={
                                    // tslint:disable-next-line:jsx-no-lambda
                                    () => this.onPublishTypeSelect("manually")}>Manually</Button>{" "}
                                <Button disabled={this.state.isProcessing} onClick={
                                    // tslint:disable-next-line:jsx-no-lambda
                                    () => this.onPublishTypeSelect("automatically")}>Automatically (with MetaMask)</Button>

                            {!this.state.metaMaskNetwork ? <Alert color="warning">
                                You can publish note automatically via MetaMask but you have no extension. Choose "Manually" or <a href="https://metamask.io" target="_blank">install Metamask extension</a> to do automatically
                                </Alert> : this.state.metaMaskNetwork === "Mainnet" ? <Alert color="primary">
                                    You can publish note automatically via MetaMask. Press button "Automatically" and confirm transaction (you pay only fee)
                                </Alert> :
                                    <Alert color="warning">
                                        If you want your note to be displayed here, please select "Mainnet" in MetaMask (page will be reloaded)
                                </Alert>}
                        </Container>}
                        {this.state.publishType === "manually" &&
                        <div>
                            <h4>Manually publishing</h4>
                            Send ETH transaction to any address with next input data (HEX): <br/>
                            <code>{this.state.publishDataHex}</code>
                        </div>}
                        
                    </CardFooter>
                </Card>
            </div>
        );
    }

    private checkMetamaskNet = () => {
        if (typeof (window as any).web3 !== 'undefined') {
            const netVersion = (window as any).ethereum.networkVersion as string
            switch (netVersion) {
                case "1": return "Mainnet"
                case "2": return "Morden"
                case "3": return "Ropsten"
                case "4": return "Rinkeby"
                case "42": return "Kovan"
                default: return "Unknown"
            }
        }
        return false
    }

    private onPublishTypeSelect = async (type: string) => {
        if (this.state.publishType === type ) {
            this.setState({ publishType: "", isProcessing: false })
            return
        }
        await this.setState({ publishType: type, isProcessing: true })
        if (type === "automatically") {
            if (typeof (window as any).web3 !== 'undefined' && this.state.publishDataHex !== "") {
                const toastID = toast(`Please confirm transaction in MetaMask`, { autoClose: false, type: toast.TYPE.INFO })
                const enabled = await (window as any).web3.currentProvider.enable();
                if (enabled) {
                    const mmweb3 = new Web3((window as any).web3)
                    const curAddr = enabled[0]
                    try {
                        const tx = this.createNewTransaction(this.state.publishDataHex, curAddr)
                        const txRes = await mmweb3.eth.sendTransaction(tx)
                        if (txRes) {
                            this.setState({ notePublished: `Transaction ${txRes.transactionHash} has been sent and will appear shortly` })
                            toast.update(toastID, {
                                autoClose: 5000,
                                render: `Transaction ${txRes.transactionHash} has been sent and will appear shortly`,
                                type: toast.TYPE.SUCCESS
                            });
                            this.setState({ publishType: "", isProcessing: false })
                            // toast(`Transaction ${txRes.transactionHash} has been sent and will appear shortly`, { type: toast.TYPE.SUCCESS })
                        }
                    } catch (err) {
                        toast.update(toastID, {
                            autoClose: 5000,
                            render: `Error sending transaction or it was cancelled`,
                            type: toast.TYPE.ERROR
                        });
                        this.setState({ publishType: "", isProcessing: false })
                    }
                }
            } else {
                toast("You have no MetaMask extension :(", { type: toast.TYPE.ERROR });
                this.setState({ publishType: "", isProcessing: false })
            }
        }
    }

    private onTextChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        await this.setState({ dataText: event.target.value })
        await this.calculateEstimatePrice()
    }

    private onFileAdded = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            await this.setState({ dataFile: event.target.files[0] })
            await this.calculateEstimatePrice()
        }
    }

    private calculateEstimatePrice = async () => {
        const web3 = this.props.web3Instance

        if (this.state.dataType === DATA_TYPES_NEW[0] && this.state.dataText !== "") {
            // Text data
            const hex = web3.utils.stringToHex(this.state.dataText)
            const bytes = web3.utils.hexToBytes(hex).length
            const previewTx = this.createNewTransaction(hex, "")
            const estGas = await web3.eth.estimateGas(previewTx)
            const gasPrice = await web3.eth.getGasPrice()
            const ethFee = web3.utils.fromWei(estGas * gasPrice + "", "ether")
            // console.log(`GasEst: ${estGas} GasPrice: ${gasPrice} ETHFeeEst: ${ethFee}ETH HEX: ${hex}`)
            this.setState({estGas, gasPrice, publishDataHex: hex, dataLength: bytes, estPrice: `${ethFee}ETH ≈${(parseFloat(ethFee) * this.state.ethPrice).toPrecision(2)}$` })

        } else if (this.state.dataType === DATA_TYPES_NEW[1] && this.state.dataFile !== {} as File) {
            // File data
            const fileByteArray: number[] = []
            const fileResult = await new Response(this.state.dataFile).arrayBuffer()
            const limit = 120000
            if (fileResult && fileResult.byteLength < limit) {
                const byteArray = new Uint8Array(fileResult)
                // console.log(byteArray)
                for (let i = 0; i < byteArray.byteLength; i++) {
                    fileByteArray.push(byteArray[i])
                }
                const hex = web3.utils.bytesToHex(fileByteArray)
                // console.log(byteArray.byteLength, byteArray.byteLength < 120000)
                const previewTx = this.createNewTransaction(hex, "")
                const estGas = await web3.eth.estimateGas(previewTx)
                const gasPrice = await web3.eth.getGasPrice()
                const ethFee = web3.utils.fromWei(estGas * gasPrice + "", "ether")
                // console.log(`GasEst: ${estGas} GasPrice: ${gasPrice} ETHFeeEst: ${ethFee}ETH`)
                this.setState({estGas, gasPrice, publishDataHex: hex, dataLength: fileResult.byteLength, estPrice: `${ethFee}ETH ≈${(parseFloat(ethFee) * this.state.ethPrice).toPrecision(2)}$` })
            } else {
                toast("File should be no more than 115KB (ETH limit)", { type: toast.TYPE.ERROR });
            }



            // const hex = web3.utils.bytesToHex(this.state.dataFile.getAs)
        } else {
            this.setState({ estPrice: "Fill fields to calculate" })
        }
    }

    private createNewTransaction = (dataHex: string, fromAddr: string): Tx => {
        // const web3 = this.props.web3Instance
        const tx = fromAddr === "" ? {
            data: dataHex,
            to: DEFAULT_ADDRESS_ETH
        } as Tx : {
            data: dataHex,
            from: fromAddr,
            gas: this.state.estGas,
            gasPrice: this.state.gasPrice,
            to: DEFAULT_ADDRESS_ETH,
            value: 0,
        } as Tx
        return tx
    }

    private onDataTypeChange = async (type: string[]) => {
        await this.setState({ dataType: type })
    }

    private onNetworkTypeChange = async (type: string) => {
        await this.setState({ network: type })
    }

    private netIcon(net: string) {
        switch (net) {
            case "ethereum": return process.env.PUBLIC_URL + `images/eth_icon.svg`
        }
        return ""
    }

    private async getEthPrice() {
        const ethTicker = await fetch('https://api.coinmarketcap.com/v1/ticker/ethereum/')
        const json = await ethTicker.json()
        const price: number = json[0].price_usd
        if (json) {
            this.setState({ ethPrice: price })
        }
    }

    // private noteLink(hash: string) {
    //     return "https://etherscan.io/tx/" + hash
    // }

    // private toggle = () => this.setState({ timeTooltipOpen: !this.state.timeTooltipOpen })

    // private async loadNote(hash: string) {
    //     try {
    //         const notesReq = await fetch(API_URL + "/note/view/" + hash, {
    //             method: 'GET'
    //         })
    //         const noteJson: INote = await notesReq.json()
    //         this.setState({ note: noteJson })
    //     }
    //     catch (err) { process.stdout.write(err) }
    // }

}

export default NewNote;