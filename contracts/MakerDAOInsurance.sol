pragma solidity ^0.5.16;

contract MakerDAOInsurance {
    using SafeMath for *;
    using NameFilter for string;


    //*********
    // STRUCTS
    //*********
    struct Player {
        uint256 id;     // agent id
        bytes32 name;   // agent name
        uint256 gen;    // general vault
        uint256 ref;    // referral vault
        bool isAgent;   // referral activated
        uint256 eth;    // eth player has paid
        uint256 shares;   // shares
        uint256 units;  // uints of insurance
        uint256 plyrLastSeen; // last day player played
        uint256 mask;   // player mask
        uint256 level;
        uint256 accumulatedRef;
    }


    //***************
    // EXTERNAL DATA
    //***************

    TOP SAI_TOP = TOP(0x9b0ccf7C8994E19F39b2B4CF708e0A7DF65fA8a3);
    TUB SAI_TUB = TUB(0x448a5065aeBB8E423F0896E6c5D525C040f59af3);
    Underwriter underwriter = Underwriter(0xbeef);
    
    address payable constant private developer = address(0xe853A139b87dD816f052A60Ef646Fd89f7964545);
    address payable constant private hakka = address(0xe853A139b87dD816f052A60Ef646Fd89f7964545);
    uint256 public end;
    bool public ended;


    //******************
    // GLOBAL VARIABLES
    //******************
    mapping(address => mapping(uint256 => uint256)) public unitToExpirePlayer;
    mapping(uint256 => uint256) public unitToExpire; // unit of insurance due at day x

    uint256 public issuedInsurance; // all issued insurance
    uint256 public ethOfShare;        // virtual eth of bought shares
    uint256 public shares;            // totalSupply of share
    uint256 public pot;             // eth gonna pay to beneficiary
    uint256 public today;           // today's date
    uint256 public _now;            // current time
    uint256 public mask;            // global mask
    uint256 public agents;          // number of agent

    // player data
    mapping(address => Player) public player; // player data
    mapping(uint256 => address) public agentxID_; // return agent address by id
    mapping(bytes32 => address) public agentxName_; // return agent address by name

    // constant parameters
    uint256 constant maxInsurePeriod = 100;
    uint256 constant maxLevel = 10;

    // rate of buying x day insurance
    uint256[101] public rate =
    [0,
    1000000000000000000,
    1990000000000000000,
    2970100000000000000,
    3940399000000000000,
    4900995010000000000,
    5851985059900000000,
    6793465209301000000,
    7725530557207990000,
    8648275251635910100,
    9561792499119550999,
    10466174574128355489,
    11361512828387071934,
    12247897700103201215,
    13125418723102169203,
    13994164535871147511,
    14854222890512436036,
    15705680661607311676,
    16548623854991238559,
    17383137616441326173,
    18209306240276912911,
    19027213177874143782,
    19836941046095402344,
    20638571635634448321,
    21432185919278103838,
    22217864060085322800,
    22995685419484469572,
    23765728565289624876,
    24528071279636728627,
    25282790566840361341,
    26029962661171957728,
    26769663034560238151,
    27501966404214635769,
    28226946740172489411,
    28944677272770764517,
    29655230500043056872,
    30358678195042626303,
    31055091413092200040,
    31744540498961278040,
    32427095093971665260,
    33102824143031948607,
    33771795901601629121,
    34434077942585612830,
    35089737163159756702,
    35738839791528159135,
    36381451393612877544,
    37017636879676748769,
    37647460510879981281,
    38270985905771181468,
    38888276046713469653,
    39499393286246334956,
    40104399353383871606,
    40703355359850032890,
    41296321806251532561,
    41883358588189017235,
    42464525002307127063,
    43039879752284055792,
    43609480954761215234,
    44173386145213603082,
    44731652283761467051,
    45284335760923852380,
    45831492403314613856,
    46373177479281467717,
    46909445704488653040,
    47440351247443766510,
    47965947734969328845,
    48486288257619635557,
    49001425375043439201,
    49511411121293004809,
    50016297010080074761,
    50516134039979274013,
    51010972699579481273,
    51500862972583686460,
    51985854342857849595,
    52465995799429271099,
    52941335841434978388,
    53411922483020628604,
    53877803258190422318,
    54339025225608518095,
    54795634973352432914,
    55247678623618908585,
    55695201837382719499,
    56138249819008892304,
    56576867320818803381,
    57011098647610615347,
    57440987661134509194,
    57866577784523164102,
    58287912006677932461,
    58705032886611153136,
    59117982557745041605,
    59526802732167591189,
    59931534704845915277,
    60332219357797456124,
    60728897164219481563,
    61121608192577286747,
    61510392110651513880,
    61895288189544998741,
    62276335307649548754,
    62653571954573053266,
    63027036235027322733,
    63396765872677049506];

    // threshold of agent upgrade
    uint256[10] public requirement =
    [0,
    73890560989306501,
    200855369231876674,
    545981500331442382,
    1484131591025766010,
    4034287934927351160,
    10966331584284585813,
    29809579870417282259,
    81030839275753838749,
    220264657948067161559];


    //******************
    // EVENT
    //******************
    event UPGRADE (address indexed agent, uint256 level);
    event BUYINSURANCE(address indexed buyer, uint256 indexed start, uint256 unit,  uint256 date);


    //******************
    // MODIFIER
    //******************
    modifier isHuman() {
        require(msg.sender == tx.origin, "sorry humans only");
        _;
    }


    /**
     * @dev Constructor
     * @notice Initialize the time
     */
    constructor() public {
        _now = now;
        today = _now / 1 days;
    }

    /**
     * @dev Ticker
     * @notice It is called everytime when a player interacts with this contract
     * @return true if MakerDAO has been shut down, false otherwise
     */
    function tick()
        internal
        returns(bool)
    {
        if(!ended) {
            if (_now != now) {
                _now = now;
                uint256 _today; // the current day as soon as ticker is called

                //check MakerDAO status
                ended = SAI_TUB.off();
                end = SAI_TOP.caged();

                _today = ended ? end / 1 days : _now / 1 days;

                // calculate the outdated issuedInsurance
                while (today < _today) {
                    issuedInsurance = issuedInsurance.sub(unitToExpire[today]);
                    today += 1;
                }
            }
        }
        
        return ended;
    }

    /**
     * @dev Register
     * @notice Register a name by a human player
     */
    function register(string calldata _nameString)
        external
        payable
        isHuman()
    {
        bytes32 _name = _nameString.nameFilter();
        address _agent = msg.sender;
        require(msg.value >= 10000000000000000);
        require(agentxName_[_name] == address(0));

        if(!player[_agent].isAgent){
            agents += 1;
            player[_agent].isAgent = true;
            player[_agent].id = agents;
            player[_agent].level = 1;
            agentxID_[agents] = _agent;
        }
        // set name active for the player
        player[_agent].name = _name;
        agentxName_[_name] = _agent;

        if(!developer.send(msg.value)){
            pot = pot.add(msg.value);
        }
    }

    /**
     * @dev Upgrade
     * @notice Upgrade when a player's referral bonus meet the promotion
     */
    function upgrade()
        external
        isHuman()
    {
        address _agent = msg.sender;
        require(player[_agent].isAgent);
        require(player[_agent].level < maxLevel);

        if(player[_agent].accumulatedRef >= requirement[player[_agent].level]){
            player[_agent].level = (1).add(player[_agent].level);
            emit UPGRADE(_agent,player[_agent].level);
        }
    }

    //using address for referral
    function buy(address payable _agent, uint256 _date)
        isHuman()
        public
        payable
    {
        // ticker
        if(tick()){
            msg.sender.transfer(msg.value);
            return;
        }

        // validate agent
        if(!player[_agent].isAgent){
            _agent = address(0);
        }

        buyCore(msg.sender, msg.value, _date, _agent);
    }

    //using ID for referral
    function buy(uint256 _agentId, uint256 _date)
        isHuman()
        public
        payable
    {
        // ticker
        if(tick()){
            msg.sender.transfer(msg.value);
            return;
        }

        address payable _agent = address(uint160(agentxID_[_agentId]));

        // validate agent
        if(!player[_agent].isAgent){
            _agent = address(0);
        }

        buyCore(msg.sender, msg.value, _date, _agent);
    }

    //using name for referral
    function buy(bytes32 _agentName, uint256 _date)
        isHuman()
        public
        payable
    {
        // ticker
        if(tick()){
            msg.sender.transfer(msg.value);
            return;
        }

        address payable _agent = address(uint160(agentxName_[_agentName]));

        // validate agent
        if(!player[_agent].isAgent){
            _agent = address(0);
        }

        buyCore(msg.sender, msg.value, _date, _agent);
    }

    // contract wallets, sorry insurance only for human
    function buy()
        public
        payable
    {
        // ticker
        if(tick()) {
            (new SafeSend).value(msg.value)(msg.sender);
            return;
        }

        buyCore(msg.sender, msg.value, 0, address(0));
    }

    // fallback
    function () external payable {
        buy();
    }

    /**
     * @dev Core part of buying
     */
    function buyCore(address _buyer, uint256 _eth, uint256 _date, address payable _agent) internal {

        updatePlayerUnit(_buyer);
        
        require(_eth >= 1000000000, "pocket lint: not a valid currency");

        if(_date > maxInsurePeriod){
            _date = maxInsurePeriod;
        }
        uint256 _rate = rate[_date] + 1000000000000000000;
        uint256 ethToBuyShare = _eth.mul(1000000000000000000) / _rate;
        //-- ethToBuyShare is a virtual amount used to represent the eth player paid for buying shares, which is usually different from _eth

        // get value of shares and insurances can be bought
        uint256 _share = underwriter.mintShare(ethOfShare, ethToBuyShare);
        uint256 _unit = (_date == 0)? 0: _share;
        uint256 newDate = today + _date - 1;


        // update global data
        ethOfShare = ethOfShare.add(ethToBuyShare);
        shares = shares.add(_share);
        unitToExpire[newDate] = unitToExpire[newDate].add(_unit);
        issuedInsurance = issuedInsurance.add(_unit);

        // update player data
        player[_buyer].eth = player[_buyer].eth.add(_eth);
        player[_buyer].shares = player[_buyer].shares.add(_share);
        player[_buyer].units = player[_buyer].units.add(_unit);
        unitToExpirePlayer[_buyer][newDate] = unitToExpirePlayer[_buyer][newDate].add(_unit);

        distributeEx(_eth, _agent);
        distributeIn(_buyer, _eth, _share);
        emit BUYINSURANCE(_buyer, today, _unit, _date);
    }

    /**
     * @dev Update player's units of insurance
     */
    function updatePlayerUnit(address _player) internal {
        uint256 _today = player[_player].plyrLastSeen;
        uint256 expiredUnit = 0;
        if(_today != 0){
            while(_today < today){
                expiredUnit = expiredUnit.add(unitToExpirePlayer[_player][_today]);
                _today += 1;
            }
            player[_player].units = player[_player].units.sub(expiredUnit);
        }
        player[_player].plyrLastSeen = today;
    }

    /**
     * @dev pay external stakeholder
     */
    function distributeEx(uint256 _eth, address payable _agent) internal {
        uint256 ex = _eth / 4 ;

        if(player[_agent].isAgent){
            uint256 refRate = player[_agent].level.add(6);
            uint256 _ref = _eth.mul(refRate) / 100;
            player[_agent].ref = player[_agent].ref.add(_ref);
            player[_agent].accumulatedRef = player[_agent].accumulatedRef.add(_ref);
            ex = ex.sub(_ref);
        }

        uint256 _dev = ex / 3;
        uint256 _hak = ex.sub(_dev);

        (new SafeSend).value(_dev)(developer);
        (new SafeSend).value(_hak)(hakka);
    }

    /**
     * @dev Distribute to internal
     */
    function distributeIn(address _buyer, uint256 _eth, uint256 _shares) internal {
        uint256 _gen = _eth.mul(3) / 20;

        // internal eth balance (eth = eth - (community share + ref share + dev share))
        _eth = _eth.sub(_eth / 4);

        // calculate pot
        uint256 _pot = _eth.sub(_gen);

        // distribute gen share and collect dust
        uint256 _dust = updateMasks(_buyer, _gen, _shares);

        // add eth to pot
        pot = pot.add(_dust).add(_pot);
    }

    function updateMasks(address  _player, uint256 _gen, uint256 _shares)
        private
        returns(uint256)
    {
        /* MASKING NOTES
            earnings masks are a tricky thing for people to wrap their minds around.
            the basic thing to understand here is we're going to have a global
            tracker based on profit per share for each round, that increases in
            relevant proportion to the increase in share supply.

            the player will have an additional mask that basically says "based
            on the global mask, my shares, and how much i've already withdrawn,
            how much is still owed to me?"
        */

        // calculate profit per share & global mask based on this buy:  (dust goes to pot)
        uint256 _ppt = _gen.mul(1000000000000000000) / shares;
        mask = mask.add(_ppt);

        // calculate player earning from their own buy (only based on the shares
        // they just bought). & update player earnings mask
        uint256 _pearn = (_ppt.mul(_shares)) / 1000000000000000000;
        player[_player].mask = (((mask.mul(_shares)) / 1000000000000000000).sub(_pearn)).add(player[_player].mask);

        // calculate & return dust
        return(_gen.sub( _ppt.mul(shares) / 1000000000000000000));
    }

    /**
     * @dev Submit a claim from a beneficiary
     */
    function claim()
        isHuman()
        public
    {
        require(tick()); // MakerDAO shutdown!
        address payable beneficiary = msg.sender;
        updatePlayerUnit(beneficiary);
        uint256 amount = pot.mul(player[beneficiary].units) / issuedInsurance;
        player[beneficiary].units = 0;
        beneficiary.transfer(amount);
    }

    /**
     * @dev Withdraw dividends and ref
     */
    function withdraw()
        public
    {
        // get player earnings
        uint256 _eth;
        _eth = withdrawEarnings(msg.sender);

        // pay
        if (_eth > 0){
            if(msg.sender == tx.origin)
                msg.sender.transfer(_eth);
            else
                (new SafeSend).value(_eth)(msg.sender);
        }
    }

    function withdrawEarnings(address _player)
        private
        returns(uint256)
    {
        // update gen vault
        updateGenVault(_player);

        // from vaults
        uint256 _earnings = player[_player].gen.add(player[_player].ref);
        if (_earnings > 0) {
            player[_player].gen = 0;
            player[_player].ref = 0;
        }

        return(_earnings);
    }

    function updateGenVault(address _player)
        private
    {
        uint256 _earnings = calcUnMaskedEarnings(_player);
        if (_earnings > 0) {
            // put in gen vault
            player[_player].gen = _earnings.add(player[_player].gen);
            // zero out their earnings by updating mask
            player[_player].mask = _earnings.add(player[_player].mask);
        }
    }

    function calcUnMaskedEarnings(address _player)
        private
        view
        returns(uint256)
    {
        return (mask.mul(player[_player].shares) / 1000000000000000000).sub(player[_player].mask);
    }

    /**
     * @dev Return the price buyer will pay for next 1 individual share.
     * @return Price for next share bought (in wei format)
     */
    function getBuyPrice() public view returns(uint256) {
        return underwriter.burnShare(shares.add(1000000000000000000), 1000000000000000000);
    }

    /**
     * @dev Get the units of insurance of player
     * @return Amount of existing units of insurance
     */
    function getCurrentUnit(address _player)
        public
        view
        returns(uint256)
    {
        uint256 _unit = player[_player].units;
        uint256 _today = player[_player].plyrLastSeen;
        uint256 expiredUnit = 0;
        if(_today != 0) {
            while(_today < today){
                expiredUnit = expiredUnit.add(unitToExpirePlayer[_player][_today]);
                _today += 1;
            }

        }
        return _unit == 0 ? 0 : _unit.sub(expiredUnit);
    }

    /**
     * @dev Get the list of units of insurace going to expire of a player
     * @return List of units of insurance going to expire from a player
     */
    function getExpiringUnitListPlayer(address _player)
        public
        view
        returns(uint256[maxInsurePeriod] memory expiringUnitList)
    {
        for(uint256 i=0; i<maxInsurePeriod; i++) {
            expiringUnitList[i] = unitToExpirePlayer[_player][today+i];
        }
        return(expiringUnitList);
    }

    /**
     * @dev Get the list of units of insurace going to expire
     * @return List of units of insurance going to expire
     */
    function getExpiringUnitList()
        public
        view
        returns(uint256[maxInsurePeriod] memory expiringUnitList)
    {
        for(uint256 i=0; i<maxInsurePeriod; i++){
            expiringUnitList[i] = unitToExpire[today+i];
        }
        return(expiringUnitList);
    }
}

contract TOP {
    function caged() public returns(uint256);
}

contract TUB {
    function off() public returns(bool);
}

contract SafeSend {
    constructor(address payable to) public payable {
        selfdestruct(to);
    }
}

contract Underwriter {
    using SafeMath for *;
    
    /**
     * @dev calculates number of shares received given X eth
     * @param _curEth current amount of eth in contract
     * @param _newEth eth being spent
     * @return amount of share purchased
     */
    function mintShare(uint256 _curEth, uint256 _newEth)
        external
        pure
        returns (uint256)
    {
        return(shares((_curEth).add(_newEth)).sub(shares(_curEth)));
    }

    /**
     * @dev calculates amount of eth received if you sold X shares
     * @param _curShares current amount of shares that exist
     * @param _sellShares amount of shares you wish to sell
     * @return amount of eth received
     */
    function burnShare(uint256 _curShares, uint256 _sellShares)
        external
        pure
        returns (uint256)
    {
        return((eth(_curShares)).sub(eth(_curShares.sub(_sellShares))));
    }

    /**
     * @dev calculates how many shares would exist with given an amount of eth
     * @param _eth eth "in contract"
     * @return number of shares that would exist
     */
    function shares(uint256 _eth)
        public
        pure
        returns(uint256)
    {
        return ((((((_eth).mul(1000000000000000000)).mul(312500000000000000000000000)).add(5624988281256103515625000000000000000000000000000000000000000000)).sqrt()).sub(74999921875000000000000000000000)) / (156250000);
    }

    /**
     * @dev calculates how much eth would be in contract given a number of shares
     * @param _shares number of shares minted
     * @return eth that would exists
     */
    function eth(uint256 _shares)
        public
        pure
        returns(uint256)
    {
        return ((78125000).mul(_shares.sq()).add(((149999843750000).mul(_shares.mul(1000000000000000000))) / (2))) / ((1000000000000000000).sq());
    }
}


library NameFilter {
    /**
     * @dev filters name strings
     * -converts uppercase to lower case.
     * -makes sure it does not start/end with a space
     * -makes sure it does not contain multiple spaces in a row
     * -cannot be only numbers
     * -cannot start with 0x
     * -restricts characters to A-Z, a-z, 0-9, and space.
     * @return reprocessed string in bytes32 format
     */
    function nameFilter(string memory _input)
        internal
        pure
        returns(bytes32)
    {
        bytes memory _temp = bytes(_input);
        uint256 _length = _temp.length;

        //sorry limited to 32 characters
        require (_length <= 32 && _length > 0, "string must be between 1 and 32 characters");
        // make sure it doesnt start with or end with space
        require(_temp[0] != 0x20 && _temp[_length-1] != 0x20, "string cannot start or end with space");
        // make sure first two characters are not 0x
        if (_temp[0] == 0x30)
        {
            require(_temp[1] != 0x78, "string cannot start with 0x");
            require(_temp[1] != 0x58, "string cannot start with 0X");
        }

        // create a bool to track if we have a non number character
        bool _hasNonNumber;

        // convert & check
        for (uint256 i = 0; i < _length; i++)
        {
            // if its uppercase A-Z
            if (_temp[i] > 0x40 && _temp[i] < 0x5b)
            {
                // convert to lower case a-z
                _temp[i] = byte(uint8(_temp[i]) + 32);

                // we have a non number
                if (_hasNonNumber == false)
                    _hasNonNumber = true;
            } else {
                require
                (
                    // require character is a space
                    _temp[i] == 0x20 ||
                    // OR lowercase a-z
                    (_temp[i] > 0x60 && _temp[i] < 0x7b) ||
                    // or 0-9
                    (_temp[i] > 0x2f && _temp[i] < 0x3a),
                    "string contains invalid characters"
                );
                // make sure theres not 2x spaces in a row
                if (_temp[i] == 0x20)
                    require( _temp[i+1] != 0x20, "string cannot contain consecutive spaces");

                // see if we have a character other than a number
                if (_hasNonNumber == false && (_temp[i] < 0x30 || _temp[i] > 0x39))
                    _hasNonNumber = true;
            }
        }

        require(_hasNonNumber == true, "string cannot be only numbers");

        bytes32 _ret;
        assembly {
            _ret := mload(add(_temp, 32))
        }
        return (_ret);
    }
}

library SafeMath {

    function mul(uint256 a, uint256 b)
        internal
        pure
        returns (uint256 c)
    {
        if (a == 0) return 0;
        c = a * b;
        require(c / a == b);
    }

    function sub(uint256 a, uint256 b)
        internal
        pure
        returns (uint256 c)
    {
        require(b <= a);
        c = a - b;
    }

    function add(uint256 a, uint256 b)
        internal
        pure
        returns (uint256 c)
    {
        c = a + b;
        require(c >= a);
    }

    function sqrt(uint256 x)
        internal
        pure
        returns (uint256 y)
    {
        uint256 z = ((add(x, 1)) / 2);
        y = x;
        while (z < y)
        {
            y = z;
            z = ((add((x / z), z)) / 2);
        }
    }

    function sq(uint256 x)
        internal
        pure
        returns (uint256)
    {
        return (mul(x,x));
    }

    function pwr(uint256 x, uint256 y) internal pure returns(uint256 z) {
        z = 1;
        while(y != 0){
            if(y % 2 == 1)
                z = mul(z,x);
            x = sq(x);
            y = y / 2;
        }
        return z;
    }

}
