import {http, cookieStorage, createConfig, createStorage} from 'wagmi'
import {mainnet, baseSepolia, } from 'wagmi/chains'
import {coinbaseWallet, injected} from 'wagmi/connectors'

export function getConfig() {
    return createConfig({
        chains: [baseSepolia],
        connectors: [
            coinbaseWallet({ appName: 'BASED-PAYS', preference: 'smartWalletOnly' }),
        ],
        storage: createStorage({
            storage: cookieStorage,
        }),
        transports: {
            [baseSepolia.id]: http(),

        },
    })
}

declare module 'wagmi' {
    interface Register {
        config: ReturnType<typeof getConfig>
    }
}
