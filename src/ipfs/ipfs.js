'use strict';
const ipfsAPI = require('ipfs-api');
const fs = require('fs');
const promisify = require('es6-promisify');
const spawn = require('child_process').spawn;
const multihashes = require('multihashes');

const config = require('./../config/config.js');

class IPFS {
  constructor() {
    this.connect = false;
    this.publicKey = null;
    this.id = null;
  }

  /**
   * Initalize the connection to an IPFS node. If no network configuration is given the configuration will be taken from IPFS.config.
   * @param {Object} manualConfig - Object containing the configuration parameters for IPFS. Default: { host: 'localhost', port: 5001, protocol: 'http' }
   * @return {IPFS} IPFS object
   */
  init(manualConfig) {
    if (manualConfig) {
      this._ipfs = new ipfsAPI(config.ipfs.host, config.ipfs.port, {
        protocol: config.ipfs.protocol
      });
    } else {
      this._ipfs = new ipfsAPI(config.ipfs.host,
        config.ipfs.port, {
          protocol: config.ipfs.protocol
        });
    }

    // a check to see if it connected to IPFS
    this._ipfs.id()
      .then((res) => {
        this.publickey = res.publickey;
        this.id = res.id;
        this.connect = true;
      })
      .catch((err) => {
        console.error(err);
      });
    return this._ipfs;
  }

  /** Open an IPFS daemon is a child process */
  daemon() {
    const ipfsDaemon = spawn('ipfs', ['daemon', '--manage-fdlimit']);

    ipfsDaemon.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    ipfsDaemon.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });

    ipfsDaemon.on('error', (error) => {
      console.error(error);
    });

    ipfsDaemon.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });
  }

  /**
   * Add a single file or multiple files to the connected IPFS node.
   * @param {string} filePaths - Path to file. Can also be an array of paths.
   * @return {Promise} Response of Promise is an array of objects with {path: string, hash: string, size: number, file: filePath}
   */
  addFiles(filePaths) {
    if (typeof filePaths === 'string') {
      filePaths = [filePaths];
    }

    const fileBuffers = filePaths.map((path) => {
      return fs.readFileSync(path);
    });
    // adds actual './path/path/file' to returned obj
    return promisify((filePaths, callback) => {
      this._ipfs.files.add(fileBuffers, (err, res) => {
        if (err) {
          callback(err, null);
        } else {
          res.map((obj, i) => {
            return obj.file = filePaths[i];
          });
          callback(null, res);
        }
      });
    })(filePaths);
  }

  /**
   * Retrieve a file based on his hash address from the IPFS network.
   * @param {string} hashAddress - Hashaddress of the file.
   * @param {string} writePath - Path in which to write the file to.
   * @return {Promise} Response of Promise is an array of all file buffer chunks.
   */
  download(hashAddress, writePath) {
    try {
      fs.accessSync(writePath);
    } catch(e) {
      fs.closeSync(fs.openSync(writePath, 'w'));
    }
    const writeStream = fs.createWriteStream(writePath);

    return promisify((hashAddress, callback) => {
      this._ipfs.cat(hashAddress, (err, stream) => {
        if (err) {
          callback(err);
          return;
        }
        stream.pipe(writeStream);
        let resArray = [];
        process.stdout.write('Downloading ' + hashAddress + ' to: \n');
        process.stdout.write(writePath + '\n');

        stream.on('data', function(chunk) {
          process.stdout.write('.');
          resArray.push(chunk);
        });

        stream.on('error', function(err) {
          callback(err, null);
        });

        stream.on('end', function() {
          process.stdout.write('\nDone!\n');
          callback(null, resArray);
        });
      });
    })(hashAddress);
  }

  /**
   * Take a hash address corresponding to a particular file and retrieve the Merkle Dag links of that file.
   * @param {string} hashAddress - Hash address of the file.
   * @return {Promise} Response of Promise is an array of Objects with DAGLink info. {name: String, hashAddress: String, size: Number, hash: Buffer of hash address}
   */
  links(hashAddress) {
    return promisify((hashAddress, callback) => {
      this._ipfs.object.links(hashAddress)
        .then(res => {
          res.map(DAGLink => {
            DAGLink.hashAddress = multihashes.toB58String(DAGLink.hash);
            return DAGLink;
          });
          callback(null, res);
        })
        .catch(err => {
          callback(err, null);
        });
    })(hashAddress);
  }

  /**
   * Pin a hash address to the connected to IPFS node.
   * @param {string} hashAddress - Hash address of the file.
   * @return {Promise} Response of Promise is an array of the hash addresses of the pinned files.
   */
  pin(hashAddress) {
    return this._ipfs.pin.add(hashAddress);
  }

  /**
   * Unpin a hash address to the connected to IPFS node.
   * @param {string} hashAddress - Hash address of the file.
   * @return {Promise} Response of Promise is an array of the hash addresses of the unpinned files.
   */
  unpin(hashAddress) {
    return this._ipfs.pin.rm(hashAddress);
  }
}

module.exports = new IPFS();
