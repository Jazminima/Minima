package org.minima.miniscript.functions.txn.input;

import java.util.ArrayList;

import org.minima.miniscript.Contract;
import org.minima.miniscript.exceptions.ExecutionException;
import org.minima.miniscript.functions.MinimaFunction;
import org.minima.miniscript.functions.cast.HEX;
import org.minima.miniscript.values.BooleanValue;
import org.minima.miniscript.values.NumberValue;
import org.minima.miniscript.values.Value;
import org.minima.objects.Coin;
import org.minima.objects.Transaction;
import org.minima.objects.base.MiniHash;
import org.minima.objects.base.MiniNumber;
import org.minima.utils.MinimaLogger;

/**
 * Verify that the specified output exists in the transaction.
 * @author spartacusrex
 *
 */
public class VERIFYIN extends MinimaFunction{

	public VERIFYIN() {
		super("VERIFYIN");
	}
	
	@Override
	public Value runFunction(Contract zContract) throws ExecutionException {
		
		//Which Output
		int input     = getParameter(0).getValue(zContract).getNumber().getAsInt();
		
		//Get the details
		MiniHash address  = new MiniHash(getParameter(1).getValue(zContract).getRawData());
		MiniNumber amount = getParameter(2).getValue(zContract).getNumber();
		MiniHash tokenid  = new MiniHash(getParameter(3).getValue(zContract).getRawData());
		
		//Is there a 4th Parameter ?
		int amountchecktype = 0 ;
		if(getParameterNum()>4) {
			amountchecktype = getParameter(4).getValue(zContract).getNumber().getAsInt();
		}
		
		//Check an output exists..
		Transaction trans = zContract.getTransaction();
	
		//Check output exists..
		ArrayList<Coin> ins = trans.getAllInputs();
		if(ins.size()<=input) {
			throw new ExecutionException("Input number too high "+input+"/"+ins.size());
		}
		
		//Get it..
		Coin cc = ins.get(input);
		
		//Now Check
		boolean addr = address.isExactlyEqual(cc.getAddress());  
		boolean tok  = tokenid.isExactlyEqual(cc.getTokenID());  
		
		//Amount can be 3 type.. EQ, LTE, GTE
		boolean amt  = false;
		if(amountchecktype == 0) {
			amt  = amount.isEqual(cc.getAmount());
		}else if(amountchecktype == -1) {
			amt  = cc.getAmount().isLessEqual(amount);
		}else {
			amt  = cc.getAmount().isMoreEqual(amount);
		}
		
		//Return if all true
		return new BooleanValue( addr && amt && tok );
	}
	
	@Override
	public MinimaFunction getNewFunction() {
		return new VERIFYIN();
	}

}
