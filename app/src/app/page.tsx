'use client'

import {useAccount, useConnect, useDisconnect} from 'wagmi'

function App() {
    const account = useAccount()
    const {connectors, connect, status, error} = useConnect()
    const {disconnect} = useDisconnect()
    const {address, isConnected} = useAccount();

    return (
        <>
            <div>
                <div>
                    <h2>Account</h2>

                    <div>
                        status: {status}
                        <br/>
                        address: {address ? JSON.stringify(address) : 'No address connected'}
                        <br/>
                        chainId: {account?.chain?.id || 'No chain connected'}
                    </div>

                    {account.status === 'connected' && (
                        <button type="button" onClick={() => disconnect()}>
                            Disconnect
                        </button>
                    )}
                </div>

                <div>
                    <h2>Connect</h2>
                    {connectors.map((connector) => (
                        <button
                            key={connector.uid}
                            onClick={() => connect({connector})}
                            type="button"
                        >
                            {connector.name}
                        </button>
                    ))}
                    {status && <div>{status}</div>}


                    <div>{error?.message}</div>
                </div>
            </div>
        </>
    )
}

export default App
