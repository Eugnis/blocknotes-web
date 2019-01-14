export interface INote {
    id: string
    net_name: string
    net_type: string
    hash: string
    address: string
    block_num: number
    data_type: string
    data_size: number
    text_preview: string
    tx_time: Date
}