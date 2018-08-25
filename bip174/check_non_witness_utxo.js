const bitcoinjsLib = require('bitcoinjs-lib');
const {OP_EQUAL} = require('bitcoin-ops');
const {OP_HASH160} = require('bitcoin-ops');
const {Transaction} = require('bitcoinjs-lib');

const {decompile} = bitcoinjsLib.script;
const p2shHashByteLength = 20;

/** Check that an input's non witness utxo is valid

  {
    hash: <Input Redeem Script RIPEMD160 Hash Buffer Object>
    script: <Input Redeem Script Buffer Object>
    utxo: <Non-Witness UTXO Transaction Buffer Object>
  }

  @throws
  <RedeemScriptDoesNotMatchUtxo Error>
*/
module.exports = ({hash, script, utxo}) => {
  const scriptPubHashes = Transaction.fromBuffer(utxo).outs.map(out => {
    const [hash160, scriptHash, isEqual] = decompile(out.script);

    if (hash160 !== OP_HASH160) {
      return null;
    }

    if (scriptHash.length !== p2shHashByteLength) {
      return null;
    }

    if (isEqual !== OP_EQUAL) {
      return null;
    }

    return scriptHash;
  });

  if (!scriptPubHashes.find(h => !!h && h.equals(hash))) {
    throw new Error('RedeemScriptDoesNotMatchUtxo');
  }

  return;
};
