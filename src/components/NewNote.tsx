import * as React from 'react';
import { toast } from 'react-toastify';

import { Button, ButtonGroup, Container, Form,  Header, Message, TextAreaProps } from 'semantic-ui-react';
import { DATA_TYPES_NEW, DEFAULT_ADDRESS_ETH, NETWORK_TYPE } from 'src/constants';
import Web3 = require('web3')
import { Tx } from 'web3/eth/types';

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
    }

    public async componentDidMount() {
        await this.getEthPrice()
    }

    public render() {
        return (
            <div>
                <Header as="h3">Creating new note</Header>
                <hr className="my-2" />
                <Form widths="equal">
                <Header as="h5">Network</Header>
                    <Form.Group style={{ justifyContent: "center" }}>

                    
                        <ButtonGroup id="networkSelect">
                            {NETWORK_TYPE.map(val => <Button key={val} color={this.state.network === val ? "blue" : "grey"} onClick={
                                // tslint:disable-next-line:jsx-no-lambda
                                () => this.onNetworkTypeChange(val)
                            }><img src={this.netIcon(val)} height="50px" alt={val} /></Button>)}
                        </ButtonGroup>

                    </Form.Group>
                    <Header as="h5">Data type</Header>
                    <Form.Group style={{ justifyContent: "center" }}>


                        <ButtonGroup id="dataTypeSelect">
                            {DATA_TYPES_NEW.map(val => <Button key={val[1]} color={this.state.dataType === val ? "blue" : "grey"} onClick={
                                // tslint:disable-next-line:jsx-no-lambda
                                () => this.onDataTypeChange(val)
                            }>{val[0]}</Button>)}
                        </ButtonGroup>

                    </Form.Group>
                    {this.state.dataType === DATA_TYPES_NEW[0] &&
                        <div>
                            <Form.TextArea label='Text Data' disabled={this.state.isProcessing} name="text" id="noteText" value={this.state.dataText} onChange={this.onTextChange} />
                            <small color="muted">Data will be encoded in HEX and published in blockchain. Anyone can view it</small>
                        </div>}
                    {this.state.dataType === DATA_TYPES_NEW[1] &&
                        <div>
                            <Form.Input label="File (Current max 115KB)" disabled={this.state.isProcessing} type="file" name="file" id="noteFile" onChange={this.onFileAdded} />
                            <small color="muted">
                                Data will be encoded in HEX and published in blockchain. Anyone can view it </small>
                        </div>}
                </Form>
                <hr className="my-2" />
                <strong>Est. fee price for {this.state.dataLength} bytes: {this.state.estPrice}</strong>
                {this.state.dataLength > 0 && this.state.publishDataHex !== "" && <Container>
                    <Button onClick={
                        // tslint:disable-next-line:jsx-no-lambda
                        () => this.onPublishTypeSelect("manually")}>Manually</Button>{" "}
                    <Button disabled={this.state.isProcessing} onClick={
                        // tslint:disable-next-line:jsx-no-lambda
                        () => this.onPublishTypeSelect("automatically")}>Automatically (with MetaMask)</Button>

                    {!this.state.metaMaskNetwork ? <Message color="orange">
                        You can publish note automatically via MetaMask but you have no extension. Choose "Manually" or <a href="https://metamask.io" target="_blank">install Metamask extension</a> to do automatically
                                </Message> : this.state.metaMaskNetwork === "Mainnet" ? <Message color="blue">
                            You can publish note automatically via MetaMask. Press button "Automatically" and confirm transaction (you pay only fee)
                                </Message> :
                            <Message color="orange">
                                If you want your note to be displayed here, please select "Mainnet" in MetaMask (page will be reloaded)
                                </Message>}
                </Container>}
                {this.state.publishType === "manually" &&
                    <div>
                        <Header as="h4">Manually publishing</Header>
                        Send ETH transaction to any address with next input data (HEX): <br />
                        <p><small>{this.state.publishDataHex}</small></p>
                    </div>}
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
        if (this.state.publishType === type) {
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

    private onTextChange = async (event: any, data: TextAreaProps) => {
        await this.setState({ dataText: data.value as string })
        await this.calculateEstimatePrice()
    }

    private onFileAdded = async (event: any) => {
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
            this.setState({ estGas, gasPrice, publishDataHex: hex, dataLength: bytes, estPrice: `${ethFee}ETH ≈${(parseFloat(ethFee) * this.state.ethPrice).toPrecision(2)}$` })

        } else if (this.state.dataType === DATA_TYPES_NEW[1] && this.state.dataFile !== {} as File) {
            // File data
            const fileByteArray: number[] = []
            const fileResult = await new Response(this.state.dataFile).arrayBuffer()
            const limit = 120000
            if (fileResult && fileResult.byteLength < limit) {
                const byteArray = new Uint8Array(fileResult)
                for (let i = 0; i < byteArray.byteLength; i++) {
                    fileByteArray.push(byteArray[i])
                }
                const hex = web3.utils.bytesToHex(fileByteArray)
                const previewTx = this.createNewTransaction(hex, "")
                const estGas = await web3.eth.estimateGas(previewTx)
                const gasPrice = await web3.eth.getGasPrice()
                const ethFee = web3.utils.fromWei(estGas * gasPrice + "", "ether")
                this.setState({ estGas, gasPrice, publishDataHex: hex, dataLength: fileResult.byteLength, estPrice: `${ethFee}ETH ≈${(parseFloat(ethFee) * this.state.ethPrice).toPrecision(2)}$` })
            } else {
                toast("File should be no more than 115KB (ETH limit)", { type: toast.TYPE.ERROR });
            }

        } else {
            this.setState({ estPrice: "Fill fields to calculate" })
        }
    }

    private createNewTransaction = (dataHex: string, fromAddr: string): Tx => {
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
}

export default NewNote;