"use client"

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useChainId } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { motion } from 'framer-motion'
import { Wallet, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface WalletConnectionProps {
  children: React.ReactNode
  title?: string
  description?: string
  requiredFeature?: string
}

export function WalletConnection({ 
  children, 
  title = "Connect Your Wallet",
  description = "Connect your Web3 wallet to access blockchain features",
  requiredFeature = "this feature"
}: WalletConnectionProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()

  const isCorrectNetwork = chainId === base.id || chainId === baseSepolia.id
  const networkName = chainId === base.id ? 'Base Mainnet' : 'Base Sepolia'

  if (!isConnected) {
    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="bg-gradient-to-br from-[#262626] to-[#1F1F1F] border-[#404040]/50">
            <CardHeader className="text-center pb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-[#3ECF8E] to-[#2DD4BF] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Wallet className="text-black" size={32} />
              </div>
              <CardTitle className="text-white text-2xl">{title}</CardTitle>
              <CardDescription className="text-[#A3A3A3] text-lg">
                {description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-xl bg-[#1F1F1F] border border-[#404040]/30">
                  <div className="text-2xl mb-2">🔐</div>
                  <h3 className="font-medium text-white mb-1">Secure Storage</h3>
                  <p className="text-[#A3A3A3] text-sm">Documents encrypted on IPFS</p>
                </div>
                
                <div className="text-center p-4 rounded-xl bg-[#1F1F1F] border border-[#404040]/30">
                  <div className="text-2xl mb-2">⛓️</div>
                  <h3 className="font-medium text-white mb-1">Blockchain Verified</h3>
                  <p className="text-[#A3A3A3] text-sm">Records anchored on Base L2</p>
                </div>
                
                <div className="text-center p-4 rounded-xl bg-[#1F1F1F] border border-[#404040]/30">
                  <div className="text-2xl mb-2">🤝</div>
                  <h3 className="font-medium text-white mb-1">Your Control</h3>
                  <p className="text-[#A3A3A3] text-sm">Manage access permissions</p>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle className="text-blue-400" size={14} />
                  </div>
                  <div>
                    <h4 className="text-blue-400 font-medium mb-1">Why Connect a Wallet?</h4>
                    <p className="text-[#A3A3A3] text-sm">
                      Your wallet acts as your digital identity for medical records. It ensures only you can 
                      upload, access, and manage your health data on the blockchain.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center pt-4">
                <div className="inline-block">
                  <ConnectButton.Custom>
                    {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
                      const ready = mounted
                      const connected = ready && account && chain

                      return (
                        <div
                          {...(!ready && {
                            'aria-hidden': true,
                            style: {
                              opacity: 0,
                              pointerEvents: 'none',
                              userSelect: 'none',
                            },
                          })}
                        >
                          {(() => {
                            if (!connected) {
                              return (
                                <Button
                                  onClick={openConnectModal}
                                  className="bg-gradient-to-r from-[#3ECF8E] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#3ECF8E] text-black font-medium h-12 px-8 text-lg"
                                >
                                  <Wallet className="mr-3" size={20} />
                                  Connect Wallet
                                </Button>
                              )
                            }

                            return null
                          })()}
                        </div>
                      )
                    }}
                  </ConnectButton.Custom>
                </div>
              </div>

              <div className="text-center">
                <p className="text-[#A3A3A3] text-sm">
                  Don't have a wallet? Get{' '}
                  <Button
                    variant="link"
                    className="text-[#3ECF8E] p-0 h-auto font-medium"
                    onClick={() => window.open('https://metamask.io/', '_blank')}
                  >
                    MetaMask
                  </Button>
                  {' '}or{' '}
                  <Button
                    variant="link"
                    className="text-[#3ECF8E] p-0 h-auto font-medium"
                    onClick={() => window.open('https://rainbow.me/', '_blank')}
                  >
                    Rainbow Wallet
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (!isCorrectNetwork) {
    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="bg-gradient-to-br from-red-500/10 to-[#1F1F1F] border-red-500/20">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-red-400" size={32} />
              </div>
              <CardTitle className="text-white text-2xl">Wrong Network</CardTitle>
              <CardDescription className="text-[#A3A3A3] text-lg">
                Please switch to Base network to use {requiredFeature}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-red-400 font-medium mb-1">Current Network</h4>
                    <p className="text-[#A3A3A3] text-sm">
                      {chainId ? `Chain ID: ${chainId}` : 'Unknown network'}
                    </p>
                  </div>
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                    Unsupported
                  </Badge>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-xl bg-[#1F1F1F] border border-[#404040]/30">
                  <h3 className="font-medium text-white mb-2">Base Mainnet</h3>
                  <p className="text-[#A3A3A3] text-sm mb-3">Production network</p>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    Chain ID: {base.id}
                  </Badge>
                </div>
                
                <div className="text-center p-4 rounded-xl bg-[#1F1F1F] border border-[#404040]/30">
                  <h3 className="font-medium text-white mb-2">Base Sepolia</h3>
                  <p className="text-[#A3A3A3] text-sm mb-3">Test network</p>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Chain ID: {baseSepolia.id}
                  </Badge>
                </div>
              </div>

              <div className="text-center">
                <ConnectButton.Custom>
                  {({ chain, openChainModal, mounted }) => {
                    return (
                      <Button
                        onClick={openChainModal}
                        className="bg-gradient-to-r from-[#3ECF8E] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#3ECF8E] text-black font-medium h-12 px-8"
                      >
                        Switch Network
                      </Button>
                    )
                  }}
                </ConnectButton.Custom>
              </div>

              <div className="text-center">
                <Button
                  variant="link"
                  className="text-[#3ECF8E] text-sm"
                  onClick={() => window.open('https://docs.base.org/using-base/', '_blank')}
                >
                  <ExternalLink className="mr-2" size={14} />
                  Learn how to add Base network
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Wallet connected and on correct network - show the children
  return <>{children}</>
}

export function WalletStatus() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()

  if (!isConnected) return null

  const networkName = chainId === base.id ? 'Base Mainnet' : 'Base Sepolia'
  const isCorrectNetwork = chainId === base.id || chainId === baseSepolia.id

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isCorrectNetwork ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-[#A3A3A3] text-xs">{networkName}</span>
        </div>
        <CheckCircle className="text-green-400" size={12} />
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-[#A3A3A3] text-xs">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <ConnectButton />
      </div>
    </div>
  )
}

// Compact wallet status for sidebar
export function WalletStatusCompact() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()

  if (!isConnected) {
    return (
      <div className="bg-[#262626] rounded-xl p-3 border border-[#404040]/30 shadow-lg backdrop-blur-sm">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Wallet className="text-[#A3A3A3]" size={14} />
            <span className="text-[#A3A3A3] text-xs">No Wallet</span>
          </div>
          <ConnectButton />
        </div>
      </div>
    )
  }

  const isCorrectNetwork = chainId === base.id || chainId === baseSepolia.id
  const networkName = chainId === base.id ? 'Base' : 'Base Sepolia'

  return (
    <div className="bg-[#262626]/90 rounded-xl p-3 border border-[#404040]/50 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isCorrectNetwork ? 'bg-green-400' : 'bg-red-400'}`} />
          <Wallet className="text-[#3ECF8E]" size={14} />
        </div>
        <span className="text-[#A3A3A3] text-xs">{networkName}</span>
      </div>
      
      <div className="text-center">
        <div className="text-[#A3A3A3] text-xs mb-2 font-mono">
          {address?.slice(0, 8)}...{address?.slice(-6)}
        </div>
        <ConnectButton />
      </div>
    </div>
  )
}
